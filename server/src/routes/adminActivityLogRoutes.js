const express = require('express');
const controller = require('../controllers/adminActivityLogController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin, authorize('users', 'view'));

router.get('/', controller.listLogs);
router.get('/export', controller.exportLogs);

module.exports = router;
