const express = require('express');
const controller = require('../controllers/adminReportsController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin, authorize('reports', 'view'));

router.get('/sales', controller.getSalesReport);
router.get('/orders', controller.getOrdersReport);
router.get('/customers', controller.getCustomersReport);
router.get('/products', controller.getProductsReport);
router.get('/inventory', controller.getInventoryReport);
router.get('/revenue', controller.getRevenueReport);

module.exports = router;
