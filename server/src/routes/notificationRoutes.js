const express = require('express');
const controller = require('../controllers/notificationController');
const protectCustomer = require('../middleware/customerAuth');

const router = express.Router();

router.use(protectCustomer);

router.get('/', controller.listMyNotifications);
router.patch('/:id/read', controller.markAsRead);
router.patch('/read-all', controller.markAllAsRead);

module.exports = router;
