const express = require('express');
const FragranceFamily = require('../models/FragranceFamily');
const createCrudController = require('../utils/createCrudController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
const controller = createCrudController(FragranceFamily, { populate: { path: 'collection', select: 'name' } });

router.use(protectAdmin);

router.get('/', authorize('products', 'view'), controller.list);
router.get('/:id', authorize('products', 'view'), controller.getOne);
router.post('/', authorize('products', 'create'), controller.create);
router.put('/:id', authorize('products', 'edit'), controller.update);
router.delete('/:id', authorize('products', 'delete'), controller.remove);

module.exports = router;
