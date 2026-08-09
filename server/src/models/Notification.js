const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientType: { type: String, enum: ['Customer', 'Admin'], required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientType' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientType: 1, recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
