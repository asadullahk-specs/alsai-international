const Customer = require('../models/Customer');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.getWishlist = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id).populate({
    path: 'wishlist',
    match: { isActive: true, isHidden: false },
  });
  res.status(200).json(new ApiResponse(200, { wishlist: customer.wishlist }));
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  await Customer.findByIdAndUpdate(req.customer._id, { $addToSet: { wishlist: req.params.productId } });
  res.status(200).json(new ApiResponse(200, null, 'Added to wishlist'));
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  await Customer.findByIdAndUpdate(req.customer._id, { $pull: { wishlist: req.params.productId } });
  res.status(200).json(new ApiResponse(200, null, 'Removed from wishlist'));
});
