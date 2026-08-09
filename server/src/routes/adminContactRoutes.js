const express = require('express');
const controller = require('../controllers/adminContactController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('customers', 'view'), controller.listMessages);
router.put('/:id/status', authorize('customers', 'edit'), controller.updateMessageStatus);
router.delete('/:id', authorize('customers', 'delete'), controller.deleteMessage);

module.exports = router;
