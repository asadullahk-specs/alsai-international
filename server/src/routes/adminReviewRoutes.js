const express = require('express');
const controller = require('../controllers/adminReviewController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('reviews', 'view'), controller.listReviews);
router.put('/:id/status', authorize('reviews', 'approve'), controller.updateReviewStatus);
router.delete('/:id', authorize('reviews', 'delete'), controller.deleteReview);

module.exports = router;
