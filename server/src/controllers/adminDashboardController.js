const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Review = require('../models/Review');
const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    revenueResult,
    totalOrders,
    totalCustomers,
    totalProducts,
    recentOrders,
    recentCustomers,
    lowStockProducts,
    outOfStockCount,
    pendingReviews,
    pendingMessages,
    salesByMonthRaw,
    ordersByStatus,
    topCollectionsRaw,
    latestNotifications,
  ] = await Promise.all([
    Order.aggregate([{ $match: { orderStatus: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments(),
    Customer.countDocuments(),
    Product.countDocuments(),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total orderStatus createdAt customer')
      .populate('customer', 'fullName'),
    Customer.find().sort({ createdAt: -1 }).limit(5).select('fullName email createdAt'),
    Product.find({ $expr: { $and: [{ $gt: ['$totalStock', 0] }, { $lte: ['$totalStock', '$lowStockThreshold'] }] } })
      .select('name totalStock lowStockThreshold mainImage')
      .limit(10),
    Product.countDocuments({ totalStock: 0 }),
    Review.countDocuments({ status: 'pending' }),
    ContactMessage.countDocuments({ status: 'unread' }),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Product.aggregate([
      { $group: { _id: '$collection', count: { $sum: 1 } } },
      { $lookup: { from: 'collections', localField: '_id', foreignField: '_id', as: 'collectionInfo' } },
      { $unwind: { path: '$collectionInfo', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$collectionInfo.name', 'Uncategorized'] }, count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Notification.find({ recipientType: 'Admin' }).sort({ createdAt: -1 }).limit(5),
  ]);

  const salesByMonth = salesByMonthRaw.map((s) => ({
    label: `${MONTH_NAMES[s._id.month - 1]} ${s._id.year}`,
    total: s.total,
    count: s.count,
  }));

  res.status(200).json(
    new ApiResponse(200, {
      totalRevenue: revenueResult[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      recentCustomers,
      lowStockProducts,
      outOfStockCount,
      pendingReviews,
      pendingMessages,
      salesByMonth,
      ordersByStatus,
      topCollections: topCollectionsRaw,
      latestNotifications,
    })
  );
});
