const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const getNextDocNumber = require('../utils/docNumber');
const getEnabledPaymentMethods = require('../utils/paymentMethods');

const TYPES = ['Customer Payment', 'Supplier Payment', 'Expense Payment', 'Refund', 'Other'];
const STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded', 'Partially Refunded'];

// Resolves the related record (Order/Purchase/Expense) so it can be shown
// and connected to the payment, and returns a stable label in case the
// related record is ever deleted later.
const resolveRelated = async (relatedType, relatedId) => {
  if (!relatedType || !relatedId) return { relatedLabel: '' };
  if (relatedType === 'Order') {
    const order = await Order.findById(relatedId).select('orderNumber');
    if (!order) throw new ApiError(404, 'Related order not found');
    return { relatedLabel: `Order #${order.orderNumber}` };
  }
  if (relatedType === 'Purchase') {
    const purchase = await Purchase.findById(relatedId).select('purchaseId');
    if (!purchase) throw new ApiError(404, 'Related purchase not found');
    return { relatedLabel: purchase.purchaseId };
  }
  if (relatedType === 'Expense') {
    const expense = await Expense.findById(relatedId).select('expenseId title');
    if (!expense) throw new ApiError(404, 'Related expense not found');
    return { relatedLabel: `${expense.expenseId} - ${expense.title}` };
  }
  return { relatedLabel: '' };
};

exports.listPayments = asyncHandler(async (req, res) => {
  const { search, type, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { paymentId: new RegExp(search, 'i') },
      { reference: new RegExp(search, 'i') },
      { customerName: new RegExp(search, 'i') },
      { supplierName: new RegExp(search, 'i') },
      { relatedLabel: new RegExp(search, 'i') },
    ];
  }
  if (type && type !== 'all') filter.type = type;
  if (status && status !== 'all') filter.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);

  const [payments, total, statusCounts, sumAgg] = await Promise.all([
    Payment.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Payment.countDocuments(filter),
    Payment.aggregate([{ $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Payment.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
  ]);

  const counts = {};
  STATUSES.forEach((s) => {
    counts[s] = 0;
  });
  statusCounts.forEach((s) => {
    counts[s._id] = s.count;
  });

  const byType = {};
  TYPES.forEach((t) => {
    byType[t] = 0;
  });
  sumAgg.forEach((t) => {
    byType[t._id] = t.total;
  });

  res.status(200).json(
    new ApiResponse(200, {
      payments,
      counts,
      byType,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  res.status(200).json(new ApiResponse(200, { payment }));
});

exports.getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await getEnabledPaymentMethods();
  res.status(200).json(new ApiResponse(200, { methods }));
});

exports.createPayment = asyncHandler(async (req, res) => {
  const { date, type, amount, method, status, reference, notes, relatedType, relatedId, customer, supplier } = req.body;

  if (!TYPES.includes(type)) throw new ApiError(400, 'Invalid payment type');
  if (!amount || Number(amount) <= 0) throw new ApiError(400, 'Amount must be greater than zero');
  if (!method) throw new ApiError(400, 'Payment method is required');

  if (type === 'Supplier Payment' && !supplier) throw new ApiError(400, 'Supplier is required for a supplier payment');
  if (type === 'Customer Payment' && !customer) throw new ApiError(400, 'Customer is required for a customer payment');

  const { relatedLabel } = await resolveRelated(relatedType, relatedId);

  let customerName = '';
  let supplierName = '';
  if (customer) {
    const c = await Customer.findById(customer).select('fullName');
    customerName = c?.fullName || '';
  }
  if (supplier) {
    const s = await Supplier.findById(supplier).select('name');
    supplierName = s?.name || '';
  }

  const paymentId = await getNextDocNumber('PAY');

  const payment = await Payment.create({
    paymentId,
    date: date || new Date(),
    type,
    amount: Number(amount),
    method,
    status: status && STATUSES.includes(status) ? status : 'Paid',
    reference,
    notes,
    relatedType: relatedType || '',
    relatedId: relatedType ? relatedId : undefined,
    relatedLabel,
    customer: customer || undefined,
    customerName,
    supplier: supplier || undefined,
    supplierName,
    createdBy: req.admin._id,
    createdByName: req.admin.fullName,
  });

  // Payments <-> Orders: a paid customer payment linked to an order marks it paid.
  if (relatedType === 'Order' && relatedId && payment.status === 'Paid') {
    await Order.findByIdAndUpdate(relatedId, { paymentStatus: 'paid' });
  }

  // Payments <-> Purchases/Suppliers: keep the purchase's paid amount/status in sync.
  if (relatedType === 'Purchase' && relatedId && payment.status === 'Paid') {
    const purchase = await Purchase.findById(relatedId);
    if (purchase) {
      purchase.amountPaid += payment.amount;
      purchase.paymentStatus = purchase.amountPaid >= purchase.total ? 'Paid' : 'Partially Paid';
      await purchase.save();
    }
  }

  // Payments <-> Expenses: mark the expense paid once its payment is recorded.
  if (relatedType === 'Expense' && relatedId && payment.status === 'Paid') {
    await Expense.findByIdAndUpdate(relatedId, { status: 'Paid', paymentMethod: method });
  }

  await logActivity({ admin: req.admin._id, action: 'Recorded payment', module: 'payments', details: `${payment.paymentId} (${type}) - ${payment.amount}` });

  res.status(201).json(new ApiResponse(201, { payment }, 'Payment recorded successfully'));
});

exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw new ApiError(400, 'Invalid payment status');

  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  payment.status = status;
  await payment.save();

  await logActivity({ admin: req.admin._id, action: 'Updated payment status', module: 'payments', details: `${payment.paymentId} -> ${status}` });

  res.status(200).json(new ApiResponse(200, { payment }, 'Payment updated successfully'));
});

exports.updatePayment = asyncHandler(async (req, res) => {
  const { notes, reference } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  if (notes !== undefined) payment.notes = notes;
  if (reference !== undefined) payment.reference = reference;
  await payment.save();

  await logActivity({ admin: req.admin._id, action: 'Updated payment', module: 'payments', details: payment.paymentId });

  res.status(200).json(new ApiResponse(200, { payment }, 'Payment updated successfully'));
});

exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  await logActivity({ admin: req.admin._id, action: 'Deleted payment', module: 'payments', details: payment.paymentId });

  res.status(200).json(new ApiResponse(200, null, 'Payment deleted successfully'));
});
