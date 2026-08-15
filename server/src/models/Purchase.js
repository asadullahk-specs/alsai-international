const mongoose = require('mongoose');

// A purchase made by the business from a supplier. Mirrors the shape of
// Order's item/status-timeline pattern so it stays consistent with the rest
// of the admin system. When a purchase is marked Received, its items feed
// stock increases into Product/StockHistory (see adminPurchaseController).
const purchaseItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    receivedQuantity: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: { type: String, required: true, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    purchaseDate: { type: Date, required: true, default: Date.now },
    supplierReference: { type: String, default: '' },
    items: {
      type: [purchaseItemSchema],
      validate: [(v) => v.length > 0, 'Purchase must contain at least one item'],
    },
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    notes: { type: String, default: '' },
    attachment: { type: String, default: '' },
    purchaseStatus: {
      type: String,
      enum: ['Draft', 'Ordered', 'Partially Received', 'Received', 'Cancelled'],
      default: 'Draft',
    },
    paymentStatus: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
    amountPaid: { type: Number, default: 0 },
    stockApplied: { type: Boolean, default: false },
    statusTimeline: [timelineEntrySchema],
    receivedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true }
);

purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ supplier: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
