const express = require('express');
const controller = require('../controllers/adminCustomerController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('customers', 'view'), controller.listCustomers);
router.get('/export', authorize('customers', 'view'), controller.exportCustomers);
router.get('/:id', authorize('customers', 'view'), controller.getCustomer);
router.put('/:id/status', authorize('customers', 'edit'), controller.updateCustomerStatus);

module.exports = router;
