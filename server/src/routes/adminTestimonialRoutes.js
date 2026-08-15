const express = require('express');
const controller = require('../controllers/adminTestimonialController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

// Testimonials are submitted by customers (see routes/testimonialRoutes.js),
// not authored by admins - so this router only covers moderation: viewing
// the queue, approving/rejecting, adjusting homepage display order, and
// deleting. There is intentionally no POST / (create) here.
router.get('/', authorize('content', 'view'), controller.listTestimonials);
router.put('/:id', authorize('content', 'edit'), controller.updateTestimonial);
router.put('/:id/status', authorize('content', 'edit'), controller.updateTestimonialStatus);
router.delete('/:id', authorize('content', 'edit'), controller.deleteTestimonial);

module.exports = router;
