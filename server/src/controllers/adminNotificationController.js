const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.listNotifications = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 15 } = req.query;
  const filter = { recipientType: 'Admin', recipient: req.admin._id };

  if (type && type !== 'all') filter.type = type;
  if (status === 'unread') filter.isRead = false;
  if (status === 'read') filter.isRead = true;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [notifications, total, unreadCount, typeCounts] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipientType: 'Admin', recipient: req.admin._id, isRead: false }),
    Notification.aggregate([
      { $match: { recipientType: 'Admin', recipient: req.admin._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
      typeCounts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientType: 'Admin', recipient: req.admin._id },
    { isRead: true }
  );
  res.status(200).json(new ApiResponse(200, null, 'Marked as read'));
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipientType: 'Admin', recipient: req.admin._id }, { isRead: true });
  res.status(200).json(new ApiResponse(200, null, 'All marked as read'));
});

exports.clearAll = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipientType: 'Admin', recipient: req.admin._id });
  res.status(200).json(new ApiResponse(200, null, 'All notifications cleared'));
});
