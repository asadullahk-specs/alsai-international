const crypto = require('crypto');
const Admin = require('../models/Admin');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { signAccessToken, generateRefreshTokenValue, hashToken } = require('../utils/generateTokens');
const { sendEmail } = require('../utils/sendEmail');
const { renderEmailTemplate } = require('../utils/emailTemplates');
const logActivity = require('../utils/logActivity');

const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOCK_MINUTES = Number(process.env.ACCOUNT_LOCK_MINUTES || 30);
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXPIRY_DAYS = 7;
const REMEMBER_ME_EXPIRY_DAYS = 30;

const REFRESH_COOKIE = 'alsai_admin_rt';
const CSRF_COOKIE = 'csrf_admin_token';

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/admin/auth',
  maxAge: maxAgeMs,
});

const sanitizeAdmin = (admin) => ({
  id: admin._id,
  fullName: admin.fullName,
  email: admin.email,
  avatar: admin.avatar,
  role: admin.role ? { id: admin.role._id, name: admin.role.name, permissions: admin.role.permissions } : null,
});

const issueSession = async (res, admin, req, rememberMe) => {
  const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY_DAYS : REFRESH_EXPIRY_DAYS;

  const accessToken = signAccessToken(
    { sub: admin._id.toString(), role: 'admin' },
    process.env.JWT_ADMIN_ACCESS_SECRET,
    ACCESS_EXPIRY
  );

  const refreshValue = generateRefreshTokenValue();
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    ownerType: 'Admin',
    owner: admin._id,
    tokenHash: hashToken(refreshValue),
    expiresAt,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  res.cookie(REFRESH_COOKIE, refreshValue, cookieOptions(expiryDays * 24 * 60 * 60 * 1000));

  const csrfValue = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE, csrfValue, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/admin/auth',
    maxAge: expiryDays * 24 * 60 * 60 * 1000,
  });

  return accessToken;
};

exports.login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const admin = await Admin.findOne({ email }).select('+password +loginAttempts +lockUntil').populate('role');

  if (!admin) throw new ApiError(401, 'Invalid email or password');

  if (admin.isLocked) {
    throw new ApiError(423, 'Account temporarily locked due to multiple failed attempts. Please try again later.');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    await admin.incrementLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCK_MINUTES);
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!admin.isActive) throw new ApiError(403, 'This admin account has been deactivated');

  await admin.resetLoginAttempts();
  const accessToken = await issueSession(res, admin, req, rememberMe);

  await logActivity({ admin: admin._id, action: 'Login', module: 'Authentication', ipAddress: req.ip });

  res.status(200).json(new ApiResponse(200, { accessToken, admin: sanitizeAdmin(admin) }, 'Logged in successfully'));
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'Session expired, please log in again');

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(token), ownerType: 'Admin', isRevoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Session expired, please log in again');
  }

  const admin = await Admin.findById(stored.owner).populate('role');
  if (!admin || !admin.isActive) throw new ApiError(401, 'Account not found or inactive');

  stored.isRevoked = true;
  await stored.save();

  const accessToken = await issueSession(res, admin, req, false);

  res.status(200).json(new ApiResponse(200, { accessToken }, 'Session refreshed'));
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    const stored = await RefreshToken.findOneAndUpdate({ tokenHash: hashToken(token) }, { isRevoked: true });
    if (stored) {
      await logActivity({ admin: stored.owner, action: 'Logout', module: 'Authentication', ipAddress: req.ip });
    }
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/admin/auth' });
  res.clearCookie(CSRF_COOKIE, { path: '/api/admin/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin) {
    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`;
    try {
      const { subject, html } = await renderEmailTemplate('password_reset', {
        customer_name: admin.fullName,
        reset_url: resetUrl,
      });
      await sendEmail({ to: admin.email, subject, html });
    } catch (err) {
      admin.passwordResetToken = undefined;
      admin.passwordResetExpires = undefined;
      await admin.save({ validateBeforeSave: false });
      throw new ApiError(500, 'Could not send reset email, please try again later');
    }
  }

  res.status(200).json(new ApiResponse(200, null, 'If an account exists with this email, a reset link has been sent'));
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const admin = await Admin.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!admin) throw new ApiError(400, 'Reset link is invalid or has expired');

  admin.password = password;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  await RefreshToken.updateMany({ owner: admin._id, ownerType: 'Admin' }, { isRevoked: true });
  await logActivity({ admin: admin._id, action: 'Password Reset', module: 'Authentication', ipAddress: req.ip });

  res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully, please log in'));
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { admin: sanitizeAdmin(req.admin) }));
});
