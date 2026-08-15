const Expense = require('../models/Expense');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const getNextDocNumber = require('../utils/docNumber');

exports.listExpenses = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) filter.$or = [{ expenseId: new RegExp(search, 'i') }, { title: new RegExp(search, 'i') }];
  if (category && category !== 'all') filter.category = category;
  if (status && status !== 'all') filter.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);

  const [expenses, total, totalAgg, categoryAgg] = await Promise.all([
    Expense.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Expense.countDocuments(filter),
    Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' } } }]),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      expenses,
      totalAmount: totalAgg[0]?.total || 0,
      byCategory: categoryAgg,
      categories: Expense.CATEGORIES,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, 'Expense not found');
  res.status(200).json(new ApiResponse(200, { expense }));
});

exports.createExpense = asyncHandler(async (req, res) => {
  const { date, category, title, description, amount, paymentMethod, reference, attachment, notes, status } = req.body;

  if (!Expense.CATEGORIES.includes(category)) throw new ApiError(400, 'Invalid expense category');
  if (!title || !title.trim()) throw new ApiError(400, 'Title is required');
  if (!amount || Number(amount) <= 0) throw new ApiError(400, 'Amount must be greater than zero');

  const expenseId = await getNextDocNumber('EXP');

  const expense = await Expense.create({
    expenseId,
    date: date || new Date(),
    category,
    title,
    description,
    amount: Number(amount),
    paymentMethod,
    reference,
    attachment,
    notes,
    status: status || 'Paid',
    createdBy: req.admin._id,
    createdByName: req.admin.fullName,
  });

  await logActivity({ admin: req.admin._id, action: 'Created expense', module: 'expenses', details: `${expense.expenseId} - ${expense.title}` });

  res.status(201).json(new ApiResponse(201, { expense }, 'Expense recorded successfully'));
});

exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!expense) throw new ApiError(404, 'Expense not found');

  await logActivity({ admin: req.admin._id, action: 'Updated expense', module: 'expenses', details: expense.expenseId });

  res.status(200).json(new ApiResponse(200, { expense }, 'Expense updated successfully'));
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) throw new ApiError(404, 'Expense not found');

  await logActivity({ admin: req.admin._id, action: 'Deleted expense', module: 'expenses', details: expense.expenseId });

  res.status(200).json(new ApiResponse(200, null, 'Expense deleted successfully'));
});
