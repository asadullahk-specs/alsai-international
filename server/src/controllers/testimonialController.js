const Testimonial = require('../models/Testimonial');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Testimonials are how a customer talks about their overall experience with
// the brand (as opposed to a Review, which is about one specific product).
// Submissions always start as 'pending' and only appear on the homepage
// once an admin approves them - admins never author these directly.
exports.createTestimonial = asyncHandler(async (req, res) => {
  const { rating, message } = req.body;

  const ratingNum = Number(rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }
  if (!message || !message.trim()) throw new ApiError(400, 'Please share a short message');

  const reviewImage = req.file ? `/uploads/reviews/${req.file.filename}` : '';
  const limit = reviewImage ? 100 : 150;
  if (message.trim().length > limit) {
    throw new ApiError(400, `Message must be ${limit} characters or fewer${reviewImage ? ' when a photo is attached' : ''}`);
  }

  // Customers may share more than one testimonial (e.g. after a later order,
  // or a different fragrance experience) - each submission is independent
  // and goes through its own pending -> approved/rejected review, rather
  // than being limited to a single lifetime testimonial per account.
  const testimonial = await Testimonial.create({
    customer: req.customer._id,
    customerName: req.customer.fullName,
    customerImage: req.customer.avatar || '',
    reviewImage,
    rating: ratingNum,
    message: message.trim(),
    status: 'pending',
  });

  const activeAdmins = await Admin.find({ isActive: true }).limit(20).select('_id');
  await Promise.all(
    activeAdmins.map((admin) =>
      Notification.create({
        recipientType: 'Admin',
        recipient: admin._id,
        type: 'new_testimonial',
        title: 'New Testimonial Received',
        message: `${req.customer.fullName} submitted a new testimonial.`,
        link: `/admin/testimonials`,
      })
    )
  );

  res.status(201).json(new ApiResponse(201, { testimonial }, 'Thanks for sharing! Your testimonial will appear once approved.'));
});

exports.getMyTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ customer: req.customer._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { testimonials }));
});
