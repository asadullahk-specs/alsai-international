const express = require('express');
const controller = require('../controllers/adminHomepageController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('content', 'view'), controller.getHomepageContent);
router.post('/hero-slides', authorize('content', 'edit'), controller.addHeroSlide);
router.put('/hero-slides/reorder', authorize('content', 'edit'), controller.reorderHeroSlides);
router.put('/hero-slides/:slideId', authorize('content', 'edit'), controller.updateHeroSlide);
router.delete('/hero-slides/:slideId', authorize('content', 'edit'), controller.deleteHeroSlide);
router.put('/sections', authorize('content', 'edit'), controller.updateSections);
router.put('/our-story', authorize('content', 'edit'), controller.updateOurStory);
router.put('/newsletter-section', authorize('content', 'edit'), controller.updateNewsletterSection);

module.exports = router;
