const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    action: { type: String, required: true },
    module: { type: String, required: true },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
