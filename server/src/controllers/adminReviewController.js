const Review = require('../models/Review');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listReviews = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  let query = Review.find(filter)
    .populate('customer', 'fullName email')
    .populate('product', 'name mainImage');

  if (search) {
    query = query.where({
      $or: [{ reviewText: new RegExp(search, 'i') }],
    });
  }

  const [reviews, total, counts] = await Promise.all([
    query.sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Review.countDocuments(filter),
    Review.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statusCounts = { pending: 0, approved: 0, rejected: 0 };
  counts.forEach((c) => {
    statusCounts[c._id] = c.count;
  });

  const avgResult = await Review.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      reviews,
      counts: {
        total: statusCounts.pending + statusCounts.approved + statusCounts.rejected,
        ...statusCounts,
      },
      averageRating: avgResult[0]?.avg ? Math.round(avgResult[0].avg * 10) / 10 : 0,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');

  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  review.status = status;
  await review.save();
  await Review.recalculateProductRating(review.product);

  if (status === 'approved') {
    await Notification.create({
      recipientType: 'Customer',
      recipient: review.customer,
      type: 'review_approved',
      title: 'Your Review Was Approved',
      message: 'Thanks - your review is now live on the product page.',
      link: '/orders',
    });
  }

  await logActivity({ admin: req.admin._id, action: `Review ${status}`, module: 'reviews', details: String(review._id) });

  res.status(200).json(new ApiResponse(200, { review }, `Review ${status}`));
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  await Review.recalculateProductRating(review.product);

  await logActivity({ admin: req.admin._id, action: 'Deleted review', module: 'reviews', details: String(review._id) });

  res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
});
