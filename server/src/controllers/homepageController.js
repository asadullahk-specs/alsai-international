const HomepageContent = require('../models/HomepageContent');
const Testimonial = require('../models/Testimonial');
const SeasonalCollection = require('../models/SeasonalCollection');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.getHomepage = asyncHandler(async (req, res) => {
  const [content, testimonials, activeSeasonalCollections] = await Promise.all([
    HomepageContent.findOne()
      .populate('featuredCollections')
      .populate({ path: 'bestSellers', match: { isActive: true, isHidden: false } })
      .populate({ path: 'newArrivals', match: { isActive: true, isHidden: false } }),
    Testimonial.find({ status: 'approved' }).sort({ displayOrder: 1, createdAt: -1 }).limit(12),
    SeasonalCollection.find({ isActive: true, startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }).sort({
      createdAt: -1,
    }),
  ]);

  const heroSlides = (content?.heroSlides || [])
    .filter((slide) => slide.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  res.status(200).json(
    new ApiResponse(200, {
      heroSlides,
      featuredCollections: content?.featuredCollections || [],
      bestSellers: content?.bestSellers || [],
      newArrivals: content?.newArrivals || [],
      ourStory: content?.ourStory || null,
      newsletterSection: content?.newsletterSection || null,
      testimonials,
      seasonalCollections: activeSeasonalCollections,
    })
  );
});
