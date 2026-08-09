const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.listMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientType: 'Customer', recipient: req.customer._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipientType: 'Customer',
    recipient: req.customer._id,
    isRead: false,
  });

  res.status(200).json(new ApiResponse(200, { notifications, unreadCount }));
});

exports.markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientType: 'Customer', recipient: req.customer._id },
    { isRead: true }
  );
  res.status(200).json(new ApiResponse(200, null, 'Marked as read'));
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipientType: 'Customer', recipient: req.customer._id }, { isRead: true });
  res.status(200).json(new ApiResponse(200, null, 'All marked as read'));
});
