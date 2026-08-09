const express = require('express');
const controller = require('../controllers/adminNotificationController');
const protectAdmin = require('../middleware/adminAuth');

const router = express.Router();
router.use(protectAdmin);

router.get('/', controller.listNotifications);
router.put('/:id/read', controller.markAsRead);
router.put('/mark-all-read', controller.markAllAsRead);
router.delete('/clear-all', controller.clearAll);

module.exports = router;
