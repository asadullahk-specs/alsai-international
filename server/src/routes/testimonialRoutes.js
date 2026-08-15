const express = require('express');
const { createTestimonial, getMyTestimonials } = require('../controllers/testimonialController');
const protectCustomer = require('../middleware/customerAuth');
const uploadReviewImage = require('../middleware/upload');

const router = express.Router();

router.get('/mine', protectCustomer, getMyTestimonials);
router.post('/', protectCustomer, uploadReviewImage, createTestimonial);

module.exports = router;
