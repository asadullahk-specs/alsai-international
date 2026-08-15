const express = require('express');
const controller = require('../controllers/adminPurchaseController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('purchases', 'view'), controller.listPurchases);
router.get('/:id', authorize('purchases', 'view'), controller.getPurchase);
router.post('/', authorize('purchases', 'create'), controller.createPurchase);
router.put('/:id', authorize('purchases', 'edit'), controller.updatePurchase);
router.put('/:id/status', authorize('purchases', 'edit'), controller.updatePurchaseStatus);
router.put('/:id/payment', authorize('purchases', 'edit'), controller.updatePurchasePayment);
router.delete('/:id', authorize('purchases', 'delete'), controller.deletePurchase);

module.exports = router;
