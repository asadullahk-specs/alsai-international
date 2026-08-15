const Return = require('../models/Return');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const getNextDocNumber = require('../utils/docNumber');

const STATUSES = [
  'Requested',
  'Under Review',
  'Approved',
  'Rejected',
  'Return In Transit',
  'Received',
  'Refund Pending',
  'Refunded',
  'Exchange Completed',
  'Closed',
];

exports.listReturns = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) filter.$or = [{ returnId: new RegExp(search, 'i') }, { orderNumber: new RegExp(search, 'i') }];
  if (status && status !== 'all') filter.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);

  const [returns, total, statusCounts] = await Promise.all([
    Return.find(filter)
      .populate('customer', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Return.countDocuments(filter),
    Return.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const counts = { all: 0 };
  STATUSES.forEach((s) => {
    counts[s] = 0;
  });
  statusCounts.forEach((s) => {
    counts[s._id] = s.count;
    counts.all += s.count;
  });

  res.status(200).json(
    new ApiResponse(200, {
      returns,
      counts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getReturn = asyncHandler(async (req, res) => {
  const returnDoc = await Return.findById(req.params.id)
    .populate('customer', 'fullName email phone')
    .populate('order')
    .populate('product', 'name mainImage');
  if (!returnDoc) throw new ApiError(404, 'Return not found');
  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }));
});

exports.createReturn = asyncHandler(async (req, res) => {
  const { order, product, size, quantity, reason, customerNotes, images } = req.body;

  if (!order) throw new ApiError(400, 'Original order is required');
  const orderDoc = await Order.findById(order);
  if (!orderDoc) throw new ApiError(404, 'Order not found');

  const orderItem = orderDoc.items.find((it) => String(it.product) === String(product) && it.size === size);
  if (!orderItem) throw new ApiError(400, 'This product/size was not part of the selected order');
  if (!reason) throw new ApiError(400, 'Return reason is required');

  const returnId = await getNextDocNumber('RET');

  const returnDoc = await Return.create({
    returnId,
    order: orderDoc._id,
    orderNumber: orderDoc.orderNumber,
    customer: orderDoc.customer,
    product,
    productName: orderItem.name,
    size,
    quantity: Math.min(Number(quantity) || 1, orderItem.quantity),
    reason,
    customerNotes,
    images: images || [],
    refundAmount: orderItem.price * Math.min(Number(quantity) || 1, orderItem.quantity),
    statusTimeline: [{ status: 'Requested', note: 'Return request created.' }],
    createdBy: req.admin._id,
    createdByName: req.admin.fullName,
  });

  await logActivity({ admin: req.admin._id, action: 'Created return request', module: 'returns', details: `${returnDoc.returnId} for order #${orderDoc.orderNumber}` });

  res.status(201).json(new ApiResponse(201, { returnRequest: returnDoc }, 'Return request created successfully'));
});

const pushStatus = async (returnDoc, status, note) => {
  returnDoc.status = status;
  returnDoc.statusTimeline.push({ status, note: note || `Status updated to ${status}.` });
  await returnDoc.save();
};

exports.approveReturn = asyncHandler(async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');
  await pushStatus(returnDoc, 'Approved', req.body.note || 'Return approved.');
  await logActivity({ admin: req.admin._id, action: 'Approved return', module: 'returns', details: returnDoc.returnId });
  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }, 'Return approved'));
});

exports.rejectReturn = asyncHandler(async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');
  await pushStatus(returnDoc, 'Rejected', req.body.note || 'Return rejected.');
  await logActivity({ admin: req.admin._id, action: 'Rejected return', module: 'returns', details: returnDoc.returnId });
  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }, 'Return rejected'));
});

exports.requestInfo = asyncHandler(async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');
  await pushStatus(returnDoc, 'Under Review', req.body.note || 'Additional information requested from customer.');
  await logActivity({ admin: req.admin._id, action: 'Requested info on return', module: 'returns', details: returnDoc.returnId });
  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }, 'Information requested'));
});

exports.markReceived = asyncHandler(async (req, res) => {
  const { condition, note } = req.body; // 'sellable' | 'damaged'
  if (!['sellable', 'damaged'].includes(condition)) throw new ApiError(400, 'Item condition (sellable or damaged) is required');

  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');

  returnDoc.receivedCondition = condition;

  // Returns & Refunds <-> Inventory: only sellable-condition returns are
  // added back to stock, per spec ("do not automatically add every returned
  // item back into sellable stock").
  if (condition === 'sellable' && !returnDoc.restockedToInventory) {
    const product = await Product.findById(returnDoc.product);
    if (product) {
      const sizeIndex = product.sizes.findIndex((s) => s.size === returnDoc.size);
      if (sizeIndex > -1) {
        const previousStock = product.sizes[sizeIndex].stock;
        product.sizes[sizeIndex].stock = previousStock + returnDoc.quantity;
        await product.save();

        await StockHistory.create({
          product: product._id,
          size: returnDoc.size,
          changeType: 'adjustment',
          quantityChange: returnDoc.quantity,
          previousStock,
          newStock: product.sizes[sizeIndex].stock,
          note: `Restocked from return ${returnDoc.returnId} (sellable condition)`,
          admin: req.admin._id,
          adminName: req.admin.fullName,
        });
        returnDoc.restockedToInventory = true;
      }
    }
  }

  await pushStatus(returnDoc, 'Received', note || `Item received back (${condition}).`);
  await logActivity({ admin: req.admin._id, action: 'Marked return received', module: 'returns', details: `${returnDoc.returnId} (${condition})` });

  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }, 'Return marked as received'));
});

exports.approveRefund = asyncHandler(async (req, res) => {
  const { refundAmount, note } = req.body;
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');

  if (refundAmount !== undefined) returnDoc.refundAmount = Number(refundAmount);
  await pushStatus(returnDoc, 'Refund Pending', note || 'Refund approved, pending processing.');

  await logActivity({ admin: req.admin._id, action: 'Approved refund', module: 'returns', details: `${returnDoc.returnId} - ${returnDoc.refundAmount}` });

  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }, 'Refund approved'));
});

exports.processRefund = asyncHandler(async (req, res) => {
  const { method } = req.body;
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');

  const order = await Order.findById(returnDoc.order);

  // Returns & Refunds <-> Payments: processing a refund creates/updates a
  // Payment record of type Refund, and updates the original order.
  const paymentId = await getNextDocNumber('PAY');
  const payment = await Payment.create({
    paymentId,
    date: new Date(),
    type: 'Refund',
    amount: returnDoc.refundAmount,
    method: method || order?.paymentMethod || 'other',
    status: 'Refunded',
    reference: returnDoc.returnId,
    relatedType: 'Order',
    relatedId: returnDoc.order,
    relatedLabel: order ? `Order #${order.orderNumber}` : returnDoc.orderNumber,
    customer: returnDoc.customer,
    createdBy: req.admin._id,
    createdByName: req.admin.fullName,
  });

  if (order) {
    order.paymentStatus = 'refunded';
    await order.save();
  }

  await pushStatus(returnDoc, 'Refunded', `Refund of ${returnDoc.refundAmount} processed.`);

  await logActivity({ admin: req.admin._id, action: 'Processed refund', module: 'returns', details: `${returnDoc.returnId} - ${returnDoc.refundAmount}` });

  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc, payment }, 'Refund processed'));
});

exports.exchangeReturn = asyncHandler(async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');
  await pushStatus(returnDoc, 'Exchange Completed', req.body.note || 'Exchange completed.');
  await logActivity({ admin: req.admin._id, action: 'Completed exchange', module: 'returns', details: returnDoc.returnId });
  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }, 'Exchange marked as completed'));
});

exports.closeReturn = asyncHandler(async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) throw new ApiError(404, 'Return not found');
  await pushStatus(returnDoc, 'Closed', req.body.note || 'Return closed.');
  await logActivity({ admin: req.admin._id, action: 'Closed return', module: 'returns', details: returnDoc.returnId });
  res.status(200).json(new ApiResponse(200, { returnRequest: returnDoc }, 'Return closed'));
});
