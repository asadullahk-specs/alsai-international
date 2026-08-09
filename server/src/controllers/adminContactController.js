const ContactMessage = require('../models/ContactMessage');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listMessages = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 15 } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [messages, total, unreadCount] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    ContactMessage.countDocuments(filter),
    ContactMessage.countDocuments({ status: 'unread' }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      messages,
      unreadCount,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.updateMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['unread', 'read', 'archived'].includes(status)) throw new ApiError(400, 'Invalid status');

  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!message) throw new ApiError(404, 'Message not found');

  res.status(200).json(new ApiResponse(200, { message }, 'Message updated'));
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');

  await logActivity({ admin: req.admin._id, action: 'Deleted contact message', module: 'contact', details: message.email });

  res.status(200).json(new ApiResponse(200, null, 'Message deleted'));
});
