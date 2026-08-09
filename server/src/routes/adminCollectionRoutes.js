const express = require('express');
const Collection = require('../models/Collection');
const createCrudController = require('../utils/createCrudController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
const controller = createCrudController(Collection);

router.use(protectAdmin);

router.get('/', authorize('products', 'view'), controller.list);
router.get('/:id', authorize('products', 'view'), controller.getOne);
router.post('/', authorize('products', 'create'), controller.create);
router.put('/:id', authorize('products', 'edit'), controller.update);
router.delete('/:id', authorize('products', 'delete'), controller.remove);

module.exports = router;
