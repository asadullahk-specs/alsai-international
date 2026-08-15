const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, default: '', trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

supplierSchema.index({ name: 'text', company: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Supplier', supplierSchema);
