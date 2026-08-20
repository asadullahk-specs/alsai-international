const HomepageContent = require('../models/HomepageContent');
const FeaturedCollection = require('../models/FeaturedCollection');
const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');
const SeasonalCollection = require('../models/SeasonalCollection');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyPromotionsToProducts } = require('../utils/applyPromotions');

exports.getHomepage = asyncHandler(async (req, res) => {
  // HomepageContent is used for heroSlides, featuredCollections, ourStory, and newsletter.
  // Best Sellers and New Arrivals are ALWAYS queried live from the Product flags so that
  // any admin toggle (isBestSeller / isNewArrival) is immediately visible on the site.
  const [content, testimonials, activeSeasonalCollections, rawBestSellers, rawNewArrivals] = await Promise.all([
    HomepageContent.findOne().populate({ path: 'featuredCollections', match: { isActive: true } }),
    Testimonial.find({ status: 'approved' }).sort({ displayOrder: 1, createdAt: -1 }).limit(12),
    SeasonalCollection.find({ isActive: true, startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }).sort({ createdAt: -1 }),
    Product.find({ isBestSeller: true, isActive: true, isHidden: false }).limit(20),
    Product.find({ isNewArrival: true, isActive: true, isHidden: false }).sort({ createdAt: -1 }).limit(20),
  ]);

  const [bestSellers, newArrivals] = await Promise.all([
    applyPromotionsToProducts(rawBestSellers),
    applyPromotionsToProducts(rawNewArrivals),
  ]);

  // Featured Collections: prefer HomepageContent list, fall back to all active collections.
  let featuredCollections = (content?.featuredCollections || []).filter(Boolean);
  if (featuredCollections.length === 0) {
    featuredCollections = await FeaturedCollection.find({ isActive: true }).sort({ displayOrder: 1 });
  }

  const heroSlides = (content?.heroSlides || [])
    .filter((slide) => slide.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  res.status(200).json(
    new ApiResponse(200, {
      heroSlides,
      featuredCollections,
      bestSellers,
      newArrivals,
      ourStory: content?.ourStory || null,
      newsletterSection: content?.newsletterSection || null,
      testimonials,
      seasonalCollections: activeSeasonalCollections,
    })
  );
});
