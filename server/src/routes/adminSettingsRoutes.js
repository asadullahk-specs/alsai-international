const express = require('express');
const controller = require('../controllers/adminSettingsController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('settings', 'view'), controller.getSettings);
router.put('/general', authorize('settings', 'edit'), controller.updateGeneral);
router.put('/shipping', authorize('settings', 'edit'), controller.updateShipping);
router.put('/payment', authorize('settings', 'edit'), controller.updatePayment);
router.put('/pricing', authorize('settings', 'edit'), controller.updatePricing);
router.put('/email', authorize('settings', 'edit'), controller.updateEmail);
router.put('/security', authorize('settings', 'edit'), controller.updateSecurity);

module.exports = router;
