const mongoose = require('mongoose');

const seasonalCollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    banner: { type: String, default: '' },
    applicableProducts: { type: String, enum: ['all', 'selected'], default: 'all' },
    selectedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SeasonalCollection', seasonalCollectionSchema);
