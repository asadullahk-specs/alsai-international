const express = require('express');
const controller = require('../controllers/adminWebsiteContentController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('content', 'view'), controller.getContent);
router.put('/about-page', authorize('content', 'edit'), controller.updateAboutPage);
router.put('/shop-page', authorize('content', 'edit'), controller.updateShopPage);
router.put('/gift-set-page', authorize('content', 'edit'), controller.updateGiftSetPage);
router.put('/contact-info', authorize('content', 'edit'), controller.updateContactInfo);
router.put('/contact-page', authorize('content', 'edit'), controller.updateContactPage);
router.put('/faqs-page', authorize('content', 'edit'), controller.updateFaqsPage);
router.put('/promotions-page', authorize('content', 'edit'), controller.updatePromotionsPage);
router.put('/footer', authorize('content', 'edit'), controller.updateFooter);
router.put('/social-links', authorize('content', 'edit'), controller.updateSocialLinks);
router.put('/announcement-bar', authorize('content', 'edit'), controller.updateAnnouncementBar);
router.put('/faqs', authorize('content', 'edit'), controller.updateFaqs);
router.put('/policies/:type', authorize('content', 'edit'), controller.updatePolicyPage);

module.exports = router;
