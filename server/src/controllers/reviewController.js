const Review = require('../models/Review');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createReview = asyncHandler(async (req, res) => {
  const { productId, rating, reviewText } = req.body;

  if (!productId || !rating || !reviewText) {
    throw new ApiError(400, 'Product, rating, and review text are required');
  }
  const ratingNum = Number(rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const alreadyReviewed = await Review.findOne({ product: productId, customer: req.customer._id });
  if (alreadyReviewed) throw new ApiError(400, 'You have already reviewed this product');

  // Uploaded straight from the customer's device - the one exception to the
  // Google-Drive-link media policy that governs every other image on the site.
  const image = req.file ? `/uploads/reviews/${req.file.filename}` : '';

  const review = await Review.create({
    product: productId,
    customer: req.customer._id,
    rating: ratingNum,
    reviewText,
    image,
  });

  const activeAdmins = await Admin.find({ isActive: true }).limit(20).select('_id');
  await Promise.all(
    activeAdmins.map((admin) =>
      Notification.create({
        recipientType: 'Admin',
        recipient: admin._id,
        type: 'new_review',
        title: 'New Review Received',
        message: `A new ${ratingNum}-star review was submitted for ${product.name}.`,
        link: `/admin/reviews`,
      })
    )
  );

  res.status(201).json(new ApiResponse(201, { review }, 'Thanks for your review! It will appear once approved.'));
});

exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 30);

  const filter = { product: productId, status: 'approved' };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('customer', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    })
  );
});
