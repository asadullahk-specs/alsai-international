const mongoose = require('mongoose');

// Actual payment/transaction records - distinct from Settings > Payment,
// which only configures which methods are accepted. A single payment can
// reference an Order (customer payment), a Purchase (supplier payment), an
// Expense (expense payment), or stand alone (Refund/Other).
const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    type: {
      type: String,
      enum: ['Customer Payment', 'Supplier Payment', 'Expense Payment', 'Refund', 'Other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded', 'Partially Refunded'],
      default: 'Paid',
    },
    reference: { type: String, default: '' },
    notes: { type: String, default: '' },

    relatedType: { type: String, enum: ['Order', 'Purchase', 'Expense', 'Return', ''], default: '' },
    relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedType' },
    relatedLabel: { type: String, default: '' }, // human readable, e.g. order number/purchase id - resilient if related doc is later removed

    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: '' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ date: -1 });
paymentSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
