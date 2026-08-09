const GiftSet = require('../models/GiftSet');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.listGiftSets = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const giftSets = await GiftSet.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 }).limit(limit);
  res.status(200).json(new ApiResponse(200, { giftSets }));
});

exports.getGiftSetBySlug = asyncHandler(async (req, res) => {
  const giftSet = await GiftSet.findOne({ slug: req.params.slug, isActive: true }).populate({
    path: 'includedProducts.product',
    select: 'name slug mainImage hoverImage shortDescription sizes',
  });

  if (!giftSet) throw new ApiError(404, 'Gift set not found');

  res.status(200).json(new ApiResponse(200, { giftSet }));
});
