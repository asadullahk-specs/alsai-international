const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Packaging',
  'Rent',
  'Electricity',
  'Salaries',
  'Transportation',
  'Courier',
  'Software',
  'Maintenance',
  'Office',
  'Miscellaneous',
];

const expenseSchema = new mongoose.Schema(
  {
    expenseId: { type: String, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: '' },
    reference: { type: String, default: '' },
    attachment: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

expenseSchema.statics.CATEGORIES = EXPENSE_CATEGORIES;

module.exports = mongoose.model('Expense', expenseSchema);
