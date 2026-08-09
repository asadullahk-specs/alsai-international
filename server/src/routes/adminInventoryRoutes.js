const express = require('express');
const controller = require('../controllers/adminInventoryController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('inventory', 'view'), controller.listInventory);
router.get('/history', authorize('inventory', 'view'), controller.getStockHistory);
router.post('/adjust', authorize('inventory', 'edit'), controller.adjustStock);

module.exports = router;
