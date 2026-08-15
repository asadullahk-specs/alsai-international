const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

// Computes purchase/payment stats for a list of supplier ids in one shot,
// rather than N+1 queries per row.
const computeStatsMap = async (supplierIds) => {
  const [purchaseAgg, paymentAgg] = await Promise.all([
    Purchase.aggregate([
      { $match: { supplier: { $in: supplierIds } } },
      {
        $group: {
          _id: '$supplier',
          totalPurchases: { $sum: 1 },
          totalPurchaseValue: { $sum: '$total' },
          lastPurchaseDate: { $max: '$purchaseDate' },
        },
      },
    ]),
    Payment.aggregate([
      { $match: { supplier: { $in: supplierIds }, type: 'Supplier Payment', status: { $in: ['Paid', 'Partially Refunded'] } } },
      { $group: { _id: '$supplier', amountPaid: { $sum: '$amount' } } },
    ]),
  ]);

  const map = {};
  supplierIds.forEach((id) => {
    map[id] = { totalPurchases: 0, totalPurchaseValue: 0, lastPurchaseDate: null, amountPaid: 0 };
  });
  purchaseAgg.forEach((p) => {
    map[p._id] = {
      ...map[p._id],
      totalPurchases: p.totalPurchases,
      totalPurchaseValue: p.totalPurchaseValue,
      lastPurchaseDate: p.lastPurchaseDate,
    };
  });
  paymentAgg.forEach((p) => {
    if (!map[p._id]) map[p._id] = { totalPurchases: 0, totalPurchaseValue: 0, lastPurchaseDate: null, amountPaid: 0 };
    map[p._id].amountPaid = p.amountPaid;
  });
  return map;
};

exports.listSuppliers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { company: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }
  if (status && status !== 'all') filter.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);

  const [suppliers, total, statusCounts] = await Promise.all([
    Supplier.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Supplier.countDocuments(filter),
    Supplier.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statsMap = await computeStatsMap(suppliers.map((s) => s._id));
  const rows = suppliers.map((s) => {
    const stats = statsMap[s._id] || { totalPurchases: 0, totalPurchaseValue: 0, lastPurchaseDate: null, amountPaid: 0 };
    return {
      ...s.toObject(),
      totalPurchases: stats.totalPurchases,
      amountPaid: stats.amountPaid,
      outstandingAmount: Math.max(stats.totalPurchaseValue - stats.amountPaid, 0),
      lastPurchaseDate: stats.lastPurchaseDate,
    };
  });

  const counts = { all: total, active: 0, inactive: 0 };
  statusCounts.forEach((s) => {
    counts[s._id] = s.count;
  });

  res.status(200).json(
    new ApiResponse(200, {
      suppliers: rows,
      counts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  const [purchases, payments, productsSuppliedAgg] = await Promise.all([
    Purchase.find({ supplier: supplier._id }).sort({ purchaseDate: -1 }).limit(50),
    Payment.find({ supplier: supplier._id }).sort({ date: -1 }).limit(50),
    Purchase.aggregate([
      { $match: { supplier: supplier._id } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', productName: { $first: '$items.productName' }, unitsSupplied: { $sum: '$items.quantity' } } },
      { $sort: { unitsSupplied: -1 } },
    ]),
  ]);

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalPaid = payments
    .filter((p) => ['Paid', 'Partially Refunded'].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  res.status(200).json(
    new ApiResponse(200, {
      supplier,
      purchases,
      payments,
      productsSupplied: productsSuppliedAgg,
      totalPurchases,
      totalPaid,
      outstandingBalance: Math.max(totalPurchases - totalPaid, 0),
    })
  );
});

exports.createSupplier = asyncHandler(async (req, res) => {
  const { name, company, phone, email, address, notes, status } = req.body;
  if (!name || !name.trim()) throw new ApiError(400, 'Supplier name is required');

  const supplier = await Supplier.create({ name, company, phone, email, address, notes, status });

  await logActivity({ admin: req.admin._id, action: 'Created supplier', module: 'suppliers', details: supplier.name });

  res.status(201).json(new ApiResponse(201, { supplier }, 'Supplier created successfully'));
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  await logActivity({ admin: req.admin._id, action: 'Updated supplier', module: 'suppliers', details: supplier.name });

  res.status(200).json(new ApiResponse(200, { supplier }, 'Supplier updated successfully'));
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
  const existingPurchases = await Purchase.countDocuments({ supplier: req.params.id });
  if (existingPurchases > 0) {
    throw new ApiError(400, 'This supplier has purchase records and cannot be deleted. Mark it inactive instead.');
  }

  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  await logActivity({ admin: req.admin._id, action: 'Deleted supplier', module: 'suppliers', details: supplier.name });

  res.status(200).json(new ApiResponse(200, null, 'Supplier deleted successfully'));
});

exports.listAllSuppliers = asyncHandler(async (req, res) => {
  // Lightweight, unpaginated list for populating <select> dropdowns elsewhere
  // (Purchases form, Payments form).
  const suppliers = await Supplier.find({ status: 'active' }).select('name company').sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, { suppliers }));
});
