const express = require('express');
const controller = require('../controllers/wishlistController');
const protectCustomer = require('../middleware/customerAuth');

const router = express.Router();

router.use(protectCustomer);

router.get('/', controller.getWishlist);
router.post('/:productId', controller.addToWishlist);
router.delete('/:productId', controller.removeFromWishlist);

module.exports = router;
