const HomepageContent = require('../models/HomepageContent');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

const getOrCreateContent = async () => {
  let content = await HomepageContent.findOne();
  if (!content) content = await HomepageContent.create({});
  return content;
};

exports.getHomepageContent = asyncHandler(async (req, res) => {
  const content = await getOrCreateContent();
  await content.populate(['featuredCollections', 'bestSellers', 'newArrivals']);
  res.status(200).json(new ApiResponse(200, { content }));
});

// --- Hero Slides -------------------------------------------------------
exports.addHeroSlide = asyncHandler(async (req, res) => {
  const content = await getOrCreateContent();
  content.heroSlides.push({ ...req.body, displayOrder: req.body.displayOrder ?? content.heroSlides.length });
  await content.save();
  await logActivity({ admin: req.admin._id, action: 'Added hero slide', module: 'content', details: req.body.heading });
  res.status(201).json(new ApiResponse(201, { content }, 'Hero slide added'));
});

exports.updateHeroSlide = asyncHandler(async (req, res) => {
  const content = await getOrCreateContent();
  const slide = content.heroSlides.id(req.params.slideId);
  if (!slide) throw new ApiError(404, 'Hero slide not found');
  Object.assign(slide, req.body);
  await content.save();
  res.status(200).json(new ApiResponse(200, { content }, 'Hero slide updated'));
});

exports.deleteHeroSlide = asyncHandler(async (req, res) => {
  const content = await getOrCreateContent();
  const slide = content.heroSlides.id(req.params.slideId);
  if (!slide) throw new ApiError(404, 'Hero slide not found');
  slide.deleteOne();
  await content.save();
  res.status(200).json(new ApiResponse(200, { content }, 'Hero slide removed'));
});

exports.reorderHeroSlides = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;
  const content = await getOrCreateContent();
  orderedIds.forEach((id, index) => {
    const slide = content.heroSlides.id(id);
    if (slide) slide.displayOrder = index;
  });
  await content.save();
  res.status(200).json(new ApiResponse(200, { content }, 'Slide order updated'));
});

// --- Section pickers -----------------------------------------------------
exports.updateSections = asyncHandler(async (req, res) => {
  const { featuredCollections, bestSellers, newArrivals } = req.body;
  const content = await getOrCreateContent();
  if (featuredCollections) content.featuredCollections = featuredCollections;
  if (bestSellers) content.bestSellers = bestSellers;
  if (newArrivals) content.newArrivals = newArrivals;
  await content.save();
  await content.populate(['featuredCollections', 'bestSellers', 'newArrivals']);
  await logActivity({ admin: req.admin._id, action: 'Updated homepage sections', module: 'content', details: '' });
  res.status(200).json(new ApiResponse(200, { content }, 'Homepage sections updated'));
});

// --- Our Story & Newsletter section --------------------------------------
exports.updateOurStory = asyncHandler(async (req, res) => {
  const content = await getOrCreateContent();
  content.ourStory = { ...content.ourStory?.toObject?.(), ...req.body };
  await content.save();
  await logActivity({ admin: req.admin._id, action: 'Updated Our Story section', module: 'content', details: '' });
  res.status(200).json(new ApiResponse(200, { content }, 'Our Story updated'));
});

exports.updateNewsletterSection = asyncHandler(async (req, res) => {
  const content = await getOrCreateContent();
  content.newsletterSection = { ...content.newsletterSection?.toObject?.(), ...req.body };
  await content.save();
  res.status(200).json(new ApiResponse(200, { content }, 'Newsletter section updated'));
});
