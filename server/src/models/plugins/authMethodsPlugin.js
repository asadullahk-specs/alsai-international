const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function authMethodsPlugin(schema) {
  schema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  });

  schema.pre('save', async function hashPassword(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });

  schema.methods.comparePassword = async function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
  };

  schema.methods.incrementLoginAttempts = async function incrementLoginAttempts(maxAttempts, lockMinutes) {
    if (this.lockUntil && this.lockUntil < Date.now()) {
      this.loginAttempts = 1;
      this.lockUntil = undefined;
    } else {
      this.loginAttempts = (this.loginAttempts || 0) + 1;
      if (this.loginAttempts >= maxAttempts) {
        this.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      }
    }
    await this.save({ validateBeforeSave: false });
  };

  schema.methods.resetLoginAttempts = async function resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    this.lastLogin = new Date();
    await this.save({ validateBeforeSave: false });
  };

  schema.methods.createPasswordResetToken = function createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    return resetToken;
  };
}

module.exports = authMethodsPlugin;
