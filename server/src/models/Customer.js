const mongoose = require('mongoose');
const authMethodsPlugin = require('./plugins/authMethodsPlugin');

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dob: { type: Date, required: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLogin: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

customerSchema.plugin(authMethodsPlugin);

module.exports = mongoose.model('Customer', customerSchema);
