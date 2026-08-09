const express = require('express');
const controller = require('../controllers/adminTestimonialController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('content', 'view'), controller.listTestimonials);
router.post('/', authorize('content', 'edit'), controller.createTestimonial);
router.put('/:id', authorize('content', 'edit'), controller.updateTestimonial);
router.delete('/:id', authorize('content', 'edit'), controller.deleteTestimonial);

module.exports = router;
