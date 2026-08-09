const mongoose = require('mongoose');

// NOTE for Phase 5 (admin panel): per the client's instruction, orders older than
// 50 days must stop appearing in the admin's order list/search, while remaining
// fully visible to the customer who placed them (their account, reviews, and order
// history are unaffected). Implement this as a query-time filter on admin-facing
// endpoints (createdAt >= now - 50 days) rather than deleting or flagging the
// document - the data must persist so the customer-facing endpoints in this phase
// are completely unaffected by that rule.

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    size: { type: String, required: true },
    sku: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
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

const orderNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    adminName: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'Order must contain at least one item'],
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      cnic: String,
      addressLine: String,
      city: String,
      province: String,
      country: String,
    },
    paymentMethod: { type: String, enum: ['cod', 'easypaisa', 'jazzcash', 'card'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    statusTimeline: [timelineEntrySchema],
    notes: [orderNoteSchema],
    cancellableUntil: { type: Date, required: true },
    cancelledBy: { type: String, enum: ['customer', 'admin', ''], default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
