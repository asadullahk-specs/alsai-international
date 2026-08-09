const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  const normalized = email.toLowerCase().trim();
  const existing = await NewsletterSubscriber.findOne({ email: normalized });

  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
    }
    return res.status(200).json(new ApiResponse(200, null, "You're already subscribed!"));
  }

  await NewsletterSubscriber.create({ email: normalized });
  res.status(201).json(new ApiResponse(201, null, 'Thanks for subscribing!'));
});
