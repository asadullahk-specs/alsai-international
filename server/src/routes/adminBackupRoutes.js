const express = require('express');
const controller = require('../controllers/adminBackupController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin, authorize('backup', 'edit'));

router.get('/export', controller.exportBackup);
router.post('/import', controller.importBackup);

module.exports = router;
