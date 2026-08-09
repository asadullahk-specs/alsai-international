const express = require('express');
const { getProductReviews, createReview } = require('../controllers/reviewController');
const protectCustomer = require('../middleware/customerAuth');
const uploadReviewImage = require('../middleware/upload');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protectCustomer, uploadReviewImage, createReview);

module.exports = router;
