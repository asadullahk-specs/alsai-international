const express = require('express');
const controller = require('../controllers/adminProductController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(protectAdmin);

router.get('/', authorize('products', 'view'), controller.listProducts);
router.get('/:id', authorize('products', 'view'), controller.getProduct);
router.post('/', authorize('products', 'create'), controller.createProduct);
router.put('/:id', authorize('products', 'edit'), controller.updateProduct);
router.delete('/:id', authorize('products', 'delete'), controller.deleteProduct);

module.exports = router;
