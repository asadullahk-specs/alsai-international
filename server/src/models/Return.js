const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// A return/refund request tied to an existing customer Order. Kept as its
// own top-level tab (per spec) rather than nested under Orders, but every
// document still stores a direct reference back to the original order.
const returnSchema = new mongoose.Schema(
  {
    returnId: { type: String, required: true, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNumber: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },

    reason: { type: String, required: true },
    customerNotes: { type: String, default: '' },
    images: [{ type: String }],

    requestedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [
        'Requested',
        'Under Review',
        'Approved',
        'Rejected',
        'Return In Transit',
        'Received',
        'Refund Pending',
        'Refunded',
        'Exchange Completed',
        'Closed',
      ],
      default: 'Requested',
    },
    refundAmount: { type: Number, default: 0 },
    // Set when marked Received - determines whether the item is added back to
    // sellable inventory (see 'Do not automatically add every returned item
    // back into sellable stock' in the spec).
    receivedCondition: { type: String, enum: ['', 'sellable', 'damaged'], default: '' },
    restockedToInventory: { type: Boolean, default: false },

    statusTimeline: [timelineEntrySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true }
);

returnSchema.index({ order: 1 });
returnSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Return', returnSchema);
