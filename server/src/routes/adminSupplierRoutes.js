const express = require('express');
const controller = require('../controllers/adminSupplierController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('suppliers', 'view'), controller.listSuppliers);
router.get('/all', authorize('suppliers', 'view'), controller.listAllSuppliers);
router.get('/:id', authorize('suppliers', 'view'), controller.getSupplier);
router.post('/', authorize('suppliers', 'create'), controller.createSupplier);
router.put('/:id', authorize('suppliers', 'edit'), controller.updateSupplier);
router.delete('/:id', authorize('suppliers', 'delete'), controller.deleteSupplier);

module.exports = router;
