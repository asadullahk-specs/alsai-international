const express = require('express');
const controller = require('../controllers/adminPaymentController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('payments', 'view'), controller.listPayments);
router.get('/methods', authorize('payments', 'view'), controller.getPaymentMethods);
router.get('/:id', authorize('payments', 'view'), controller.getPayment);
router.post('/', authorize('payments', 'create'), controller.createPayment);
router.put('/:id', authorize('payments', 'edit'), controller.updatePayment);
router.put('/:id/status', authorize('payments', 'edit'), controller.updatePaymentStatus);
router.delete('/:id', authorize('payments', 'delete'), controller.deletePayment);

module.exports = router;
