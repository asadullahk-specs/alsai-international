const WebsiteContent = require('../models/WebsiteContent');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

const getOrCreate = async () => {
  let content = await WebsiteContent.findOne();
  if (!content) content = await WebsiteContent.create({});
  return content;
};

exports.getContent = asyncHandler(async (req, res) => {
  const content = await getOrCreate();
  res.status(200).json(new ApiResponse(200, { content }));
});

// Each section is updated independently so one save can't clobber another
// admin's in-progress edit to a different section of the same document.
const makeSectionUpdater = (section, activityLabel) =>
  asyncHandler(async (req, res) => {
    const content = await getOrCreate();
    content[section] = req.body;
    await content.save();
    await logActivity({ admin: req.admin._id, action: `Updated ${activityLabel}`, module: 'content', details: '' });
    res.status(200).json(new ApiResponse(200, { content }, `${activityLabel} updated`));
  });

exports.updateAboutPage = makeSectionUpdater('aboutPage', 'About Page');
exports.updateShopPage = makeSectionUpdater('shopPage', 'Shop Page');
exports.updateGiftSetPage = makeSectionUpdater('giftSetPage', 'Gift Set Page');
exports.updateContactInfo = makeSectionUpdater('contactInfo', 'Contact Information');
exports.updateContactPage = makeSectionUpdater('contactPage', 'Contact Page Hero');
exports.updateFaqsPage = makeSectionUpdater('faqsPage', 'FAQs Page Hero');
exports.updateFooter = makeSectionUpdater('footer', 'Footer');
exports.updateSocialLinks = makeSectionUpdater('socialLinks', 'Social Links');
exports.updateAnnouncementBar = makeSectionUpdater('announcementBar', 'Announcement Bar');
exports.updateFaqs = makeSectionUpdater('faqs', 'FAQs');

const POLICY_TYPES = ['shipping', 'terms', 'privacy', 'returns'];

// Each policy page (Shipping/Terms/Privacy/Returns) saves independently so
// editing one doesn't risk clobbering another admin's in-progress edit to a
// different policy page in another browser tab.
exports.updatePolicyPage = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!POLICY_TYPES.includes(type)) {
    return res.status(400).json(new ApiResponse(400, null, 'Unknown policy page type'));
  }
  const content = await getOrCreate();
  content.policies[type] = req.body;
  content.markModified('policies');
  await content.save();
  await logActivity({ admin: req.admin._id, action: `Updated ${type} policy page`, module: 'content', details: '' });
  res.status(200).json(new ApiResponse(200, { content }, 'Policy page updated'));
});
