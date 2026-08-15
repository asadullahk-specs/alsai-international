const express = require('express');
const controller = require('../controllers/adminExpenseController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('expenses', 'view'), controller.listExpenses);
router.get('/:id', authorize('expenses', 'view'), controller.getExpense);
router.post('/', authorize('expenses', 'create'), controller.createExpense);
router.put('/:id', authorize('expenses', 'edit'), controller.updateExpense);
router.delete('/:id', authorize('expenses', 'delete'), controller.deleteExpense);

module.exports = router;
