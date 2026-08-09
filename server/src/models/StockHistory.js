const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    changeType: { type: String, enum: ['restock', 'adjustment', 'order', 'cancellation', 'correction'], required: true },
    quantityChange: { type: Number, required: true }, // positive = added, negative = removed
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    costPrice: { type: Number }, // cost of the batch, when this entry is a restock
    note: { type: String, default: '' },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    adminName: { type: String, default: 'System' },
  },
  { timestamps: true }
);

stockHistorySchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('StockHistory', stockHistorySchema);
