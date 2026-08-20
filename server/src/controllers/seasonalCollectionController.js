const SeasonalCollection = require('../models/SeasonalCollection');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyPromotionsToProducts } = require('../utils/applyPromotions');

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
        products = await Product.find({ isActive: true, isHidden: false }).limit(24);
      } else {
        products = (c.selectedProducts || []).filter((p) => p && p.isActive && !p.isHidden);
      }

      const promoProducts = await applyPromotionsToProducts(products);

      return {
        _id: c._id,
        name: c.name,
        discountPercent: c.discountPercent,
        banner: c.banner,
        startDate: c.startDate,
        endDate: c.endDate,
        products: promoProducts,
      };
    })
  );

  const nonEmptyResults = results.filter((c) => c.products.length > 0);

  res.status(200).json(new ApiResponse(200, { campaigns: nonEmptyResults }));
});
