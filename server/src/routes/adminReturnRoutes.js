const express = require('express');
const controller = require('../controllers/adminReturnController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('returns', 'view'), controller.listReturns);
router.get('/:id', authorize('returns', 'view'), controller.getReturn);
router.post('/', authorize('returns', 'create'), controller.createReturn);
router.put('/:id/approve', authorize('returns', 'approve'), controller.approveReturn);
router.put('/:id/reject', authorize('returns', 'approve'), controller.rejectReturn);
router.put('/:id/request-info', authorize('returns', 'edit'), controller.requestInfo);
router.put('/:id/received', authorize('returns', 'edit'), controller.markReceived);
router.put('/:id/approve-refund', authorize('returns', 'approve'), controller.approveRefund);
router.put('/:id/process-refund', authorize('returns', 'approve'), controller.processRefund);
router.put('/:id/exchange', authorize('returns', 'edit'), controller.exchangeReturn);
router.put('/:id/close', authorize('returns', 'edit'), controller.closeReturn);

module.exports = router;
