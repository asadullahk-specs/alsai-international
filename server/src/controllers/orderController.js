const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const StockHistory = require('../models/StockHistory');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const getNextOrderNumber = require('../utils/orderNumber');
const { sendEmail } = require('../utils/sendEmail');
const { renderEmailTemplate } = require('../utils/emailTemplates');

const FREE_SHIPPING_THRESHOLD = 10000;
const FLAT_SHIPPING_CHARGE = 250;
const COD_FEE = 150;
const CANCEL_WINDOW_MINUTES = 15;
const PAYMENT_METHODS = ['cod', 'easypaisa', 'jazzcash', 'card'];

exports.createOrder = asyncHandler(async (req, res) => {
  // Checkout is a single simple form - name, phone, email, CNIC, address,
  // payment method - submitted fresh with every order. There's no saved-address
  // book to resolve against.
  const { items, fullName, phone, email, cnic, addressLine, city, province, country, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new ApiError(400, 'Please select a valid payment method');
  }
  if (!fullName || !phone || !email || !cnic || !addressLine || !city) {
    throw new ApiError(400, 'Please fill in your name, phone, email, CNIC, and address');
  }
  if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
    throw new ApiError(400, 'Enter a valid CNIC in the format 12345-1234567-1');
  }

  const shippingAddress = {
    fullName,
    phone,
    email,
    cnic,
    addressLine,
    city,
    province: province || '',
    country: country || 'Pakistan',
  };

  // Re-validate every item against the live database - the client's cart is only
  // ever a list of {productId, size, quantity}; price and stock always come from here.
  const orderItems = [];
  const stockUpdates = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive || product.isHidden) {
      throw new ApiError(400, 'A product in your cart is no longer available');
    }
    const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
    if (sizeIndex === -1) {
      throw new ApiError(400, `${product.name} is no longer available in size ${item.size}`);
    }
    const sizeEntry = product.sizes[sizeIndex];
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (sizeEntry.stock < quantity) {
      throw new ApiError(400, `Only ${sizeEntry.stock} of ${product.name} (${item.size}) left in stock`);
    }

    const price = sizeEntry.salePrice || sizeEntry.price;
    subtotal += price * quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.mainImage,
      size: item.size,
      sku: sizeEntry.sku,
      price,
      quantity,
    });

    stockUpdates.push({ product, sizeIndex, quantity });
  }

  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CHARGE;
  const codFee = paymentMethod === 'cod' ? COD_FEE : 0;
  const total = subtotal + shippingCharge + codFee;

  // Only decrement stock once everything above has validated successfully
  for (const { product, sizeIndex, quantity } of stockUpdates) {
    const previousStock = product.sizes[sizeIndex].stock;
    product.sizes[sizeIndex].stock -= quantity;
    await product.save();
    await StockHistory.create({
      product: product._id,
      size: product.sizes[sizeIndex].size,
      changeType: 'order',
      quantityChange: -quantity,
      previousStock,
      newStock: product.sizes[sizeIndex].stock,
      note: 'Reserved for a new order',
      adminName: 'System',
    });
  }

  const orderNumber = await getNextOrderNumber();

  const order = await Order.create({
    orderNumber,
    customer: req.customer._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCharge,
    codFee,
    total,
    statusTimeline: [{ status: 'pending', note: 'Order has been placed successfully.' }],
    cancellableUntil: new Date(Date.now() + CANCEL_WINDOW_MINUTES * 60 * 1000),
  });

  await Notification.create({
    recipientType: 'Customer',
    recipient: req.customer._id,
    type: 'order_placed',
    title: 'Order Placed',
    message: `Your order #${order.orderNumber} has been placed successfully.`,
    link: `/orders/${order._id}`,
  });

  const admins = await Admin.find({ isActive: true }).limit(20).select('_id');
  await Promise.all(
    admins.map((a) =>
      Notification.create({
        recipientType: 'Admin',
        recipient: a._id,
        type: 'new_order',
        title: 'New Order Received',
        message: `Order #${order.orderNumber} has been placed. Amount: PKR ${order.total}.`,
        link: `/admin/orders/${order._id}`,
      })
    )
  );

  res.status(201).json(new ApiResponse(201, { order }, 'Order placed successfully'));

  // Fire-and-forget: order confirmation email should never block or fail the response.
  renderEmailTemplate('order_confirmation', {
    customer_name: req.customer.fullName,
    order_number: order.orderNumber,
    order_date: new Date(order.createdAt).toLocaleString(),
    order_total: `PKR ${order.total.toLocaleString()}`,
  })
    .then(({ subject, html }) => sendEmail({ to: req.customer.email, subject, html }))
    .catch((err) => console.error('[orderController] Failed to send order confirmation email:', err.message));
});

exports.listMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { customer: req.customer._id };
  if (status && status !== 'all') filter.orderStatus = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 50);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!order) throw new ApiError(404, 'Order not found');
  res.status(200).json(new ApiResponse(200, { order }));
});

exports.cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.orderStatus === 'cancelled') throw new ApiError(400, 'This order is already cancelled');
  if (['shipped', 'delivered'].includes(order.orderStatus)) throw new ApiError(400, 'This order can no longer be cancelled');
  if (new Date() > order.cancellableUntil) throw new ApiError(400, 'The 15-minute cancellation window has passed');

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
          note: 'Restored after customer cancellation',
          adminName: 'System',
        });
      }
    }
  }

  order.orderStatus = 'cancelled';
  order.cancelledBy = 'customer';
  order.statusTimeline.push({ status: 'cancelled', note: 'Order cancelled by customer.' });
  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
});
