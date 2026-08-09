const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const StockHistory = require('../models/StockHistory');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

// Per the client's instruction, orders older than 50 days stop appearing to the
// admin (list/search/counts), while remaining fully visible to the customer who
// placed them. This filter is applied only on admin-facing queries below.
const ADMIN_VISIBILITY_DAYS = 50;
const visibilityCutoff = () => new Date(Date.now() - ADMIN_VISIBILITY_DAYS * 24 * 60 * 60 * 1000);

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];

exports.listOrders = asyncHandler(async (req, res) => {
  const { search, status, paymentStatus, page = 1, limit = 10 } = req.query;
  const filter = { createdAt: { $gte: visibilityCutoff() } };

  if (search) {
    filter.$or = [
      { orderNumber: new RegExp(search, 'i') },
      { 'shippingAddress.fullName': new RegExp(search, 'i') },
      { 'shippingAddress.phone': new RegExp(search, 'i') },
    ];
  }
  if (status && status !== 'all') filter.orderStatus = status;
  if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [orders, total, statusCounts] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: { createdAt: { $gte: visibilityCutoff() } } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
  ]);

  const counts = { all: 0, pending: 0, confirmed: 0, processing: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  statusCounts.forEach((s) => {
    counts[s._id] = s.count;
    counts.all += s.count;
  });

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      counts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'fullName email phone createdAt');
  if (!order) throw new ApiError(404, 'Order not found');

  const totalOrdersFromCustomer = await Order.countDocuments({ customer: order.customer._id });

  res.status(200).json(new ApiResponse(200, { order, customerTotalOrders: totalOrdersFromCustomer }));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'This order is cancelled and its status can no longer be changed');
  }
  if (orderStatus && !STATUS_FLOW.includes(orderStatus)) {
    throw new ApiError(400, 'Invalid order status');
  }

  if (orderStatus && orderStatus !== order.orderStatus) {
    order.orderStatus = orderStatus;
    order.statusTimeline.push({ status: orderStatus, note: note || `Status updated to ${orderStatus}.` });
    if (orderStatus === 'delivered') order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;

    await Notification.create({
      recipientType: 'Customer',
      recipient: order.customer,
      type: 'order_status_update',
      title: `Order ${orderStatus[0].toUpperCase()}${orderStatus.slice(1)}`,
      message: `Your order #${order.orderNumber} is now ${orderStatus}.`,
      link: `/orders/${order._id}`,
    });
  }

  await order.save();

  await logActivity({
    admin: req.admin._id,
    action: 'Updated order status',
    module: 'orders',
    details: `Order #${order.orderNumber} -> ${order.orderStatus}`,
  });

  res.status(200).json(new ApiResponse(200, { order }, 'Order updated successfully'));
});

exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const allowed = ['pending', 'paid', 'failed', 'refunded'];
  if (!allowed.includes(paymentStatus)) throw new ApiError(400, 'Invalid payment status');

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.paymentStatus = paymentStatus;
  await order.save();

  await logActivity({
    admin: req.admin._id,
    action: 'Updated payment status',
    module: 'orders',
    details: `Order #${order.orderNumber} payment -> ${paymentStatus}`,
  });

  res.status(200).json(new ApiResponse(200, { order }, 'Payment status updated'));
});

exports.addNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) throw new ApiError(400, 'Note text is required');

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.notes.push({ text: text.trim(), admin: req.admin._id, adminName: req.admin.fullName });
  await order.save();

  res.status(201).json(new ApiResponse(201, { order }, 'Note added'));
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.orderStatus === 'cancelled') throw new ApiError(400, 'This order is already cancelled');
  if (order.orderStatus === 'delivered') throw new ApiError(400, 'A delivered order cannot be cancelled');

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
      if (sizeIndex > -1) {
        const previousStock = product.sizes[sizeIndex].stock;
        product.sizes[sizeIndex].stock += item.quantity;
        await product.save();
        await StockHistory.create({
          product: product._id,
          size: item.size,
          changeType: 'cancellation',
          quantityChange: item.quantity,
          previousStock,
          newStock: product.sizes[sizeIndex].stock,
          note: 'Restored after admin cancellation',
          admin: req.admin._id,
          adminName: req.admin.fullName,
        });
      }
    }
  }

  order.orderStatus = 'cancelled';
  order.cancelledBy = 'admin';
  order.statusTimeline.push({ status: 'cancelled', note: 'Order cancelled by admin.' });
  await order.save();

  await Notification.create({
    recipientType: 'Customer',
    recipient: order.customer,
    type: 'order_cancelled',
    title: 'Order Cancelled',
    message: `Your order #${order.orderNumber} was cancelled by our team. Contact support for details.`,
    link: `/orders/${order._id}`,
  });

  await logActivity({ admin: req.admin._id, action: 'Cancelled order', module: 'orders', details: `Order #${order.orderNumber}` });

  res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled and stock restored'));
});
