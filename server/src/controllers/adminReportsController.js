const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Per the client's instruction, admin reports are always scoped to exactly one
// calendar month - never a custom shorter or longer range. `month` is expected as
// "YYYY-MM"; defaults to the current month if omitted or malformed.
const resolveMonthRange = (monthParam) => {
  const match = /^(\d{4})-(\d{2})$/.exec(monthParam || '');
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const month = match ? Number(match[2]) - 1 : now.getMonth();

  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
  const label = start.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  return { start, end, label };
};

exports.getSalesReport = asyncHandler(async (req, res) => {
  const { start, end, label } = resolveMonthRange(req.query.month);
  const matchStage = { createdAt: { $gte: start, $lt: end }, orderStatus: { $ne: 'cancelled' } };

  const [summary, dailyRaw, byPaymentMethod, topProducts] = await Promise.all([
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          totalDiscounts: { $sum: '$discount' },
          itemsSold: { $sum: { $sum: '$items.quantity' } },
        },
      },
    ]),
    Order.aggregate([
      { $match: matchStage },
      { $group: { _id: { $dayOfMonth: '$createdAt' }, total: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: matchStage },
      { $group: { _id: { $ifNull: ['$paymentMethod', 'cod'] }, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: { product: '$items.product', name: { $ifNull: ['$items.name', 'Unknown Product'] } },
          unitsSold: { $sum: '$items.quantity' },
          totalSales: { $sum: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] } },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const refundsResult = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, paymentStatus: 'refunded' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const totalCustomers = await Order.distinct('customer', matchStage);

  res.status(200).json(
    new ApiResponse(200, {
      label,
      totalSales: summary[0]?.totalSales || 0,
      totalOrders: summary[0]?.totalOrders || 0,
      totalDiscounts: summary[0]?.totalDiscounts || 0,
      itemsSold: summary[0]?.itemsSold || 0,
      totalCustomers: totalCustomers.length,
      averageOrderValue: summary[0]?.totalOrders ? Math.round(summary[0].totalSales / summary[0].totalOrders) : 0,
      refunds: refundsResult[0]?.total || 0,
      dailySales: dailyRaw.map((d) => ({ day: d._id, total: d.total })),
      byPaymentMethod: byPaymentMethod.map((p) => ({ method: p._id || 'cod', total: p.total })),
      topProducts,
    })
  );
});

exports.getOrdersReport = asyncHandler(async (req, res) => {
  const { start, end, label } = resolveMonthRange(req.query.month);
  const matchStage = { createdAt: { $gte: start, $lt: end } };

  const byStatus = await Order.aggregate([{ $match: matchStage }, { $group: { _id: '$orderStatus', count: { $sum: 1 } } }]);
  const total = await Order.countDocuments(matchStage);

  res.status(200).json(new ApiResponse(200, { label, total, byStatus }));
});

exports.getCustomersReport = asyncHandler(async (req, res) => {
  const { start, end, label } = resolveMonthRange(req.query.month);

  const [newCustomers, repeatBuyersRaw] = await Promise.all([
    Customer.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: '$customer', orders: { $sum: 1 } } },
      { $match: { orders: { $gt: 1 } } },
      { $count: 'count' },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      label,
      newCustomers,
      repeatBuyers: repeatBuyersRaw[0]?.count || 0,
    })
  );
});

exports.getProductsReport = asyncHandler(async (req, res) => {
  const { start, end, label } = resolveMonthRange(req.query.month);

  const topSelling = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, orderStatus: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: { product: '$items.product', name: { $ifNull: ['$items.name', 'Unknown Product'] } },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 20 },
  ]);

  const categoryPerformance = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, orderStatus: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDoc' },
    },
    { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
    {
      $lookup: { from: 'collections', localField: 'productDoc.collection', foreignField: '_id', as: 'collectionDoc' },
    },
    { $unwind: { path: '$collectionDoc', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$collectionDoc.name', 'Uncategorized'] },
        revenue: { $sum: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] } },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  res.status(200).json(new ApiResponse(200, { label, topSelling, categoryPerformance }));
});

exports.getInventoryReport = asyncHandler(async (req, res) => {
  const products = await Product.find().select('name sizes lowStockThreshold');
  let totalUnits = 0;
  let totalValue = 0;
  let lowStock = 0;
  let outOfStock = 0;

  products.forEach((p) => {
    p.sizes.forEach((s) => {
      totalUnits += s.stock;
      totalValue += (s.costPrice || 0) * s.stock;
      if (s.stock === 0) outOfStock += 1;
      else if (s.stock <= p.lowStockThreshold) lowStock += 1;
    });
  });

  res.status(200).json(new ApiResponse(200, { totalProducts: products.length, totalUnits, totalValue, lowStock, outOfStock }));
});

exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { start, end, label } = resolveMonthRange(req.query.month);
  const matchStage = { createdAt: { $gte: start, $lt: end }, orderStatus: { $ne: 'cancelled' } };

  const result = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        grossRevenue: { $sum: '$subtotal' },
        discounts: { $sum: '$discount' },
        shipping: { $sum: '$shippingCharge' },
        netRevenue: { $sum: '$total' },
      },
    },
  ]);

  // Cost of goods sold, from the per-size costPrice captured during Inventory restocks.
  const cogsResult = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDoc' },
    },
    { $unwind: '$productDoc' },
    {
      $project: {
        quantity: '$items.quantity',
        size: '$items.size',
        sizes: '$productDoc.sizes',
      },
    },
  ]);

  let cogs = 0;
  cogsResult.forEach((row) => {
    const sizeEntry = row.sizes.find((s) => s.size === row.size);
    if (sizeEntry?.costPrice) cogs += sizeEntry.costPrice * row.quantity;
  });

  const netRevenue = result[0]?.netRevenue || 0;
  const grossProfit = netRevenue - cogs;

  // Purchases <-> Reports / Expenses <-> Reports: fold business spending into
  // the same monthly window so Revenue reflects true net profit, not just
  // storefront gross profit.
  const [purchasesAgg, expensesAgg] = await Promise.all([
    Purchase.aggregate([
      { $match: { purchaseDate: { $gte: start, $lt: end }, purchaseStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Expense.aggregate([{ $match: { date: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  const totalPurchases = purchasesAgg[0]?.total || 0;
  const totalExpenses = expensesAgg[0]?.total || 0;
  const netProfit = grossProfit - totalExpenses;

  res.status(200).json(
    new ApiResponse(200, {
      label,
      grossRevenue: result[0]?.grossRevenue || 0,
      discounts: result[0]?.discounts || 0,
      shipping: result[0]?.shipping || 0,
      netRevenue,
      costOfGoodsSold: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      grossMarginPercent: netRevenue ? Math.round((grossProfit / netRevenue) * 1000) / 10 : 0,
      totalPurchases,
      totalExpenses,
      netProfit: Math.round(netProfit),
    })
  );
});

exports.getBusinessReport = asyncHandler(async (req, res) => {
  const { start, end, label } = resolveMonthRange(req.query.month);

  const [purchasesByStatus, purchasesTotal, expensesByCategory, expensesTotal, topSuppliers] = await Promise.all([
    Purchase.aggregate([
      { $match: { purchaseDate: { $gte: start, $lt: end } } },
      { $group: { _id: '$purchaseStatus', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]),
    Purchase.aggregate([
      { $match: { purchaseDate: { $gte: start, $lt: end }, purchaseStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([{ $match: { date: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Purchase.aggregate([
      { $match: { purchaseDate: { $gte: start, $lt: end }, purchaseStatus: { $ne: 'Cancelled' } } },
      { $lookup: { from: 'suppliers', localField: 'supplier', foreignField: '_id', as: 'supplierDoc' } },
      { $unwind: '$supplierDoc' },
      { $group: { _id: '$supplier', name: { $first: '$supplierDoc.name' }, total: { $sum: '$total' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      label,
      totalPurchases: purchasesTotal[0]?.total || 0,
      purchaseCount: purchasesTotal[0]?.count || 0,
      purchasesByStatus,
      totalExpenses: expensesTotal[0]?.total || 0,
      expensesByCategory,
      topSuppliers,
    })
  );
});
