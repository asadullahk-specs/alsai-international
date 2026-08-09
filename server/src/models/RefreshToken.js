const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ['Customer', 'Admin'], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'ownerType' },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// MongoDB automatically removes documents once expiresAt is in the past.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
