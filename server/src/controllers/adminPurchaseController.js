const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const getNextDocNumber = require('../utils/docNumber');

const STATUSES = ['Draft', 'Ordered', 'Partially Received', 'Received', 'Cancelled'];

const computeTotals = (items, productMap) => {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  const normalizedItems = items.map((it) => {
    const quantity = Number(it.quantity) || 0;
    const unitCost = Number(it.unitCost) || 0;
    const discount = Number(it.discount) || 0;
    const tax = Number(it.tax) || 0;
    const lineSubtotal = quantity * unitCost;
    const lineTotal = Math.max(lineSubtotal - discount + tax, 0);
    subtotal += lineSubtotal;
    discountTotal += discount;
    taxTotal += tax;
    // The form only ever sends the product's id, not its name - the
    // Purchase schema requires productName on every line item (so a
    // purchase still shows readable product names even if a product is
    // later renamed or deleted), so it has to be resolved and attached
    // here. Without this, Purchase.create()/save() throws a validation
    // error on items.N.productName and the whole request silently fails.
    const productName = productMap.get(String(it.product)) || it.productName || 'Unknown product';
    return { ...it, productName, quantity, unitCost, discount, tax, total: lineTotal };
  });
  const total = normalizedItems.reduce((sum, it) => sum + it.total, 0);
  return { normalizedItems, subtotal, discountTotal, taxTotal, total };
};

// Builds a productId -> name lookup for whichever product ids appear in the
// submitted items, so computeTotals can stamp each line with its product's
// current name.
const buildProductNameMap = async (items) => {
  const ids = [...new Set(items.map((it) => it.product).filter(Boolean))];
  if (ids.length === 0) return new Map();
  const products = await Product.find({ _id: { $in: ids } }).select('name');
  return new Map(products.map((p) => [String(p._id), p.name]));
};

exports.listPurchases = asyncHandler(async (req, res) => {
  const { search, status, supplier, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) filter.$or = [{ purchaseId: new RegExp(search, 'i') }, { supplierReference: new RegExp(search, 'i') }];
  if (status && status !== 'all') filter.purchaseStatus = status;
  if (supplier) filter.supplier = supplier;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);

  const [purchases, total, statusCounts, totalsAgg] = await Promise.all([
    Purchase.find(filter)
      .populate('supplier', 'name company')
      .sort({ purchaseDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Purchase.countDocuments(filter),
    Purchase.aggregate([{ $group: { _id: '$purchaseStatus', count: { $sum: 1 } } }]),
    Purchase.aggregate([{ $group: { _id: null, totalValue: { $sum: '$total' } } }]),
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
      purchases,
      counts,
      totalValue: totalsAgg[0]?.totalValue || 0,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getPurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id).populate('supplier').populate('items.product', 'name mainImage sizes');
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  res.status(200).json(new ApiResponse(200, { purchase }));
});

exports.createPurchase = asyncHandler(async (req, res) => {
  const { supplier, purchaseDate, supplierReference, items, notes, attachment, purchaseStatus } = req.body;

  if (!supplier) throw new ApiError(400, 'Supplier is required');
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'At least one item is required');

  const supplierDoc = await Supplier.findById(supplier);
  if (!supplierDoc) throw new ApiError(404, 'Supplier not found');

  const productMap = await buildProductNameMap(items);
  const { normalizedItems, subtotal, discountTotal, taxTotal, total } = computeTotals(items, productMap);

  const purchaseId = await getNextDocNumber('PUR');

  const purchase = await Purchase.create({
    purchaseId,
    supplier,
    purchaseDate: purchaseDate || new Date(),
    supplierReference,
    items: normalizedItems,
    subtotal,
    discountTotal,
    taxTotal,
    total,
    notes,
    attachment,
    purchaseStatus: purchaseStatus && STATUSES.includes(purchaseStatus) ? purchaseStatus : 'Draft',
    statusTimeline: [{ status: purchaseStatus || 'Draft', note: 'Purchase created.' }],
    createdBy: req.admin._id,
    createdByName: req.admin.fullName,
  });

  await logActivity({ admin: req.admin._id, action: 'Created purchase', module: 'purchases', details: `${purchase.purchaseId} - ${supplierDoc.name}` });

  res.status(201).json(new ApiResponse(201, { purchase }, 'Purchase created successfully'));
});

exports.updatePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  if (['Received', 'Cancelled'].includes(purchase.purchaseStatus)) {
    throw new ApiError(400, `A ${purchase.purchaseStatus.toLowerCase()} purchase can no longer be edited`);
  }

  const { supplier, purchaseDate, supplierReference, items, notes, attachment } = req.body;

  if (items) {
    const productMap = await buildProductNameMap(items);
    const { normalizedItems, subtotal, discountTotal, taxTotal, total } = computeTotals(items, productMap);
    purchase.items = normalizedItems;
    purchase.subtotal = subtotal;
    purchase.discountTotal = discountTotal;
    purchase.taxTotal = taxTotal;
    purchase.total = total;
  }
  if (supplier) purchase.supplier = supplier;
  if (purchaseDate) purchase.purchaseDate = purchaseDate;
  if (supplierReference !== undefined) purchase.supplierReference = supplierReference;
  if (notes !== undefined) purchase.notes = notes;
  if (attachment !== undefined) purchase.attachment = attachment;

  await purchase.save();

  await logActivity({ admin: req.admin._id, action: 'Updated purchase', module: 'purchases', details: purchase.purchaseId });

  res.status(200).json(new ApiResponse(200, { purchase }, 'Purchase updated successfully'));
});

exports.updatePurchaseStatus = asyncHandler(async (req, res) => {
  const { purchaseStatus, note } = req.body;
  if (!STATUSES.includes(purchaseStatus)) throw new ApiError(400, 'Invalid purchase status');

  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  if (purchase.purchaseStatus === 'Cancelled') throw new ApiError(400, 'A cancelled purchase cannot be updated');

  purchase.purchaseStatus = purchaseStatus;
  purchase.statusTimeline.push({ status: purchaseStatus, note: note || `Status updated to ${purchaseStatus}.` });

  // Connect Purchases -> Inventory: once (and only once) a purchase is marked
  // Received, push its item quantities into stock. Guarded by `stockApplied`
  // so re-saving or re-selecting "Received" never double-counts stock.
  if ((purchaseStatus === 'Received' || purchaseStatus === 'Partially Received') && !purchase.stockApplied) {
    for (const item of purchase.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
      if (sizeIndex === -1) continue;

      const qtyToApply = item.quantity - item.receivedQuantity;
      if (qtyToApply <= 0) continue;

      const previousStock = product.sizes[sizeIndex].stock;
      product.sizes[sizeIndex].stock = previousStock + qtyToApply;
      product.sizes[sizeIndex].costPrice = item.unitCost;
      await product.save();

      await StockHistory.create({
        product: product._id,
        size: item.size,
        changeType: 'restock',
        quantityChange: qtyToApply,
        previousStock,
        newStock: product.sizes[sizeIndex].stock,
        costPrice: item.unitCost,
        note: `Received from purchase ${purchase.purchaseId}`,
        admin: req.admin._id,
        adminName: req.admin.fullName,
      });

      item.receivedQuantity = item.quantity;
    }

    if (purchaseStatus === 'Received') {
      purchase.stockApplied = true;
      purchase.receivedAt = new Date();
    }
  }

  await purchase.save();

  await logActivity({
    admin: req.admin._id,
    action: 'Updated purchase status',
    module: 'purchases',
    details: `${purchase.purchaseId} -> ${purchaseStatus}`,
  });

  res.status(200).json(new ApiResponse(200, { purchase }, 'Purchase status updated'));
});

exports.updatePurchasePayment = asyncHandler(async (req, res) => {
  const { paymentStatus, amountPaid } = req.body;
  const PAYMENT_STATUSES = ['Unpaid', 'Partially Paid', 'Paid'];
  if (!PAYMENT_STATUSES.includes(paymentStatus)) throw new ApiError(400, 'Invalid payment status');

  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) throw new ApiError(404, 'Purchase not found');

  purchase.paymentStatus = paymentStatus;
  // Marking a purchase Paid also settles the amount owed, so the "Amount
  // Paid" figure shown in the details panel stays consistent with the
  // status badge rather than needing a separate manual entry.
  if (paymentStatus === 'Paid') {
    purchase.amountPaid = purchase.total;
  } else if (amountPaid !== undefined) {
    purchase.amountPaid = Math.max(Number(amountPaid) || 0, 0);
  }

  purchase.statusTimeline.push({ status: `Payment: ${paymentStatus}`, note: `Payment status updated to ${paymentStatus}.` });
  await purchase.save();

  await logActivity({
    admin: req.admin._id,
    action: 'Updated purchase payment status',
    module: 'purchases',
    details: `${purchase.purchaseId} -> ${paymentStatus}`,
  });

  res.status(200).json(new ApiResponse(200, { purchase }, 'Payment status updated'));
});

exports.deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  if (purchase.stockApplied) {
    throw new ApiError(400, 'This purchase already updated inventory and cannot be deleted. Cancel it instead.');
  }

  await Purchase.findByIdAndDelete(req.params.id);

  await logActivity({ admin: req.admin._id, action: 'Deleted purchase', module: 'purchases', details: purchase.purchaseId });

  res.status(200).json(new ApiResponse(200, null, 'Purchase deleted successfully'));
});