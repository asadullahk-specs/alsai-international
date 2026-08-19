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
        products = await Product.find({ isActive: true, isHidden: false }).limit(24);
      } else {
        products = (c.selectedProducts || []).filter((p) => p && p.isActive && !p.isHidden);
      }

      // Apply the campaign's discountPercent to product size prices so products display
      // their promo discount badge (e.g. "15% OFF") and strikethrough price on the Promotions page.
      const promoProducts = products.map((p) => {
        const prodObj = p.toObject ? p.toObject() : JSON.parse(JSON.stringify(p));
        if (c.discountPercent > 0) {
          prodObj.sizes = (prodObj.sizes || []).map((s) => {
            const price = Number(s.price) || 0;
            const salePrice = Number(s.salePrice) || price;
            if (price > 0 && salePrice >= price) {
              return {
                ...s,
                salePrice: Math.round(price * (1 - c.discountPercent / 100)),
              };
            }
            return s;
          });
        }
        return prodObj;
      });

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
