const mongoose = require('mongoose');
const authMethodsPlugin = require('./plugins/authMethodsPlugin');

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLogin: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

adminSchema.plugin(authMethodsPlugin);

module.exports = mongoose.model('Admin', adminSchema);
