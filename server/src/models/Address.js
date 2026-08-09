const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, default: '', trim: true },
    country: { type: String, default: 'Pakistan', trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ customer: 1 });

module.exports = mongoose.model('Address', addressSchema);
