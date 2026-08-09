const express = require('express');
const controller = require('../controllers/orderController');
const protectCustomer = require('../middleware/customerAuth');

const router = express.Router();

router.use(protectCustomer);

router.post('/', controller.createOrder);
router.get('/', controller.listMyOrders);
router.get('/:id', controller.getMyOrder);
router.patch('/:id/cancel', controller.cancelMyOrder);

module.exports = router;
