const Collection = require('../models/Collection');
const FragranceFamily = require('../models/FragranceFamily');
const WebsiteContent = require('../models/WebsiteContent');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.getLayout = asyncHandler(async (req, res) => {
  const [collections, fragranceFamilies, websiteContent] = await Promise.all([
    Collection.find({ isActive: true }).sort({ displayOrder: 1 }),
    FragranceFamily.find({ isActive: true }).sort({ displayOrder: 1 }),
    WebsiteContent.findOne(),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      collections,
      fragranceFamilies,
      websiteContent: websiteContent || null,
    })
  );
});
