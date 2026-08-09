const ContactMessage = require('../models/ContactMessage');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.submitMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, 'Please fill in your name, email, and message');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  await ContactMessage.create({ name, email, phone, message });

  const admins = await Admin.find({ isActive: true }).limit(20).select('_id');
  await Promise.all(
    admins.map((a) =>
      Notification.create({
        recipientType: 'Admin',
        recipient: a._id,
        type: 'contact_message',
        title: 'New Contact Message',
        message: `${name} sent a new message via the contact form.`,
        link: '/admin/messages',
      })
    )
  );

  res.status(201).json(new ApiResponse(201, null, "Thanks for reaching out - we'll respond within 24 hours."));
});
