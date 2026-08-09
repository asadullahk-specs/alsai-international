const express = require('express');
const controller = require('../controllers/adminOrderController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('orders', 'view'), controller.listOrders);
router.get('/:id', authorize('orders', 'view'), controller.getOrder);
router.put('/:id/status', authorize('orders', 'edit'), controller.updateOrderStatus);
router.put('/:id/payment-status', authorize('orders', 'edit'), controller.updatePaymentStatus);
router.post('/:id/notes', authorize('orders', 'edit'), controller.addNote);
router.post('/:id/cancel', authorize('orders', 'edit'), controller.cancelOrder);

module.exports = router;
