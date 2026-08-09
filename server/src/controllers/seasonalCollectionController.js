const SeasonalCollection = require('../models/SeasonalCollection');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Public "Promotions" listing - active campaigns whose date window includes
// today, along with the discounted products each campaign applies to.
exports.listSeasonalCollections = asyncHandler(async (req, res) => {
  const now = new Date();
  const campaigns = await SeasonalCollection.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate({
      path: 'selectedProducts',
      match: { isActive: true, isHidden: false },
    })
    .sort({ createdAt: -1 });

  const results = await Promise.all(
    campaigns.map(async (c) => {
      let products;
      if (c.applicableProducts === 'all') {
        products = await Product.find({ isActive: true, isHidden: false }).limit(60);
      } else {
        products = c.selectedProducts || [];
      }

      // Promotions is a discounts page - only ever show products that
      // actually carry a live discount on at least one size, regardless of
      // how the campaign's product list was built.
      products = products.filter((p) => p.sizes?.some((s) => s.salePrice > 0 && s.salePrice < s.price)).slice(0, 24);

      return {
        _id: c._id,
        name: c.name,
        discountPercent: c.discountPercent,
        banner: c.banner,
        startDate: c.startDate,
        endDate: c.endDate,
        products,
      };
    })
  );

  // Drop campaigns that end up with no genuinely discounted products left
  // after the filter above, rather than showing an empty section.
  const nonEmptyResults = results.filter((c) => c.products.length > 0);

  res.status(200).json(new ApiResponse(200, { campaigns: nonEmptyResults }));
});
