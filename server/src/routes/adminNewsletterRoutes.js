const express = require('express');
const controller = require('../controllers/adminNewsletterController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('newsletter', 'view'), controller.listSubscribers);
router.get('/export', authorize('newsletter', 'view'), controller.exportSubscribers);
router.delete('/:id', authorize('newsletter', 'delete'), controller.removeSubscriber);

module.exports = router;
