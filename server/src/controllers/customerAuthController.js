const crypto = require('crypto');
const Customer = require('../models/Customer');
const RefreshToken = require('../models/RefreshToken');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { signAccessToken, generateRefreshTokenValue, hashToken } = require('../utils/generateTokens');
const { sendEmail } = require('../utils/sendEmail');
const { renderEmailTemplate } = require('../utils/emailTemplates');

const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOCK_MINUTES = Number(process.env.ACCOUNT_LOCK_MINUTES || 30);
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXPIRY_DAYS = 7;

const REFRESH_COOKIE = 'alsai_customer_rt';
const CSRF_COOKIE = 'csrf_customer_token';

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/customer/auth',
  maxAge: maxAgeMs,
});

const sanitizeCustomer = (customer) => ({
  id: customer._id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
  cnic: customer.cnic,
  gender: customer.gender,
  dob: customer.dob,
  avatar: customer.avatar,
  createdAt: customer.createdAt,
});

const issueSession = async (res, customer, req) => {
  const accessToken = signAccessToken(
    { sub: customer._id.toString(), role: 'customer' },
    process.env.JWT_CUSTOMER_ACCESS_SECRET,
    ACCESS_EXPIRY
  );

  const refreshValue = generateRefreshTokenValue();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    ownerType: 'Customer',
    owner: customer._id,
    tokenHash: hashToken(refreshValue),
    expiresAt,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  res.cookie(REFRESH_COOKIE, refreshValue, cookieOptions(REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000));

  const csrfValue = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE, csrfValue, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/customer/auth',
    maxAge: REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });

  return accessToken;
};

exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, cnic, gender, dob, password } = req.body;

  const existing = await Customer.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const existingCnic = await Customer.findOne({ cnic });
  if (existingCnic) throw new ApiError(409, 'An account with this CNIC already exists');

  const customer = await Customer.create({ fullName, email, phone, cnic, gender, dob, password });
  const accessToken = await issueSession(res, customer, req);

  const admins = await Admin.find({ isActive: true }).limit(20).select('_id');
  Promise.all(
    admins.map((a) =>
      Notification.create({
        recipientType: 'Admin',
        recipient: a._id,
        type: 'new_registration',
        title: 'New Customer Registered',
        message: `${customer.fullName} just created an account.`,
        link: '/admin/customers',
      })
    )
  ).catch((err) => console.error('Failed to notify admins of new registration:', err.message));

  res
    .status(201)
    .json(new ApiResponse(201, { accessToken, customer: sanitizeCustomer(customer) }, 'Account created successfully'));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const customer = await Customer.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!customer) throw new ApiError(401, 'Invalid email or password');

  if (customer.isLocked) {
    throw new ApiError(423, 'Account temporarily locked due to multiple failed attempts. Please try again later.');
  }

  const isMatch = await customer.comparePassword(password);
  if (!isMatch) {
    await customer.incrementLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCK_MINUTES);
    throw new ApiError(401, 'Invalid email or password');
  }

  if (customer.status !== 'active') {
    throw new ApiError(403, 'This account has been deactivated');
  }

  await customer.resetLoginAttempts();
  const accessToken = await issueSession(res, customer, req);

  res.status(200).json(new ApiResponse(200, { accessToken, customer: sanitizeCustomer(customer) }, 'Logged in successfully'));
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'Session expired, please log in again');

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(token), ownerType: 'Customer', isRevoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Session expired, please log in again');
  }

  const customer = await Customer.findById(stored.owner);
  if (!customer || customer.status !== 'active') {
    throw new ApiError(401, 'Account not found or inactive');
  }

  stored.isRevoked = true;
  await stored.save();

  const accessToken = await issueSession(res, customer, req);

  res.status(200).json(new ApiResponse(200, { accessToken }, 'Session refreshed'));
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await RefreshToken.updateOne({ tokenHash: hashToken(token) }, { isRevoked: true });
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/customer/auth' });
  res.clearCookie(CSRF_COOKIE, { path: '/api/customer/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const customer = await Customer.findOne({ email });

  // Always respond the same way, whether or not the email exists, to avoid leaking registered emails.
  if (customer) {
    const resetToken = customer.createPasswordResetToken();
    await customer.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      const { subject, html } = await renderEmailTemplate('password_reset', {
        customer_name: customer.fullName,
        reset_url: resetUrl,
      });
      await sendEmail({ to: customer.email, subject, html });
    } catch (err) {
      customer.passwordResetToken = undefined;
      customer.passwordResetExpires = undefined;
      await customer.save({ validateBeforeSave: false });
      throw new ApiError(500, 'Could not send reset email, please try again later');
    }
  }

  res.status(200).json(new ApiResponse(200, null, 'If an account exists with this email, a reset link has been sent'));
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const customer = await Customer.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!customer) throw new ApiError(400, 'Reset link is invalid or has expired');

  customer.password = password;
  customer.passwordResetToken = undefined;
  customer.passwordResetExpires = undefined;
  await customer.save();

  await RefreshToken.updateMany({ owner: customer._id, ownerType: 'Customer' }, { isRevoked: true });

  res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully, please log in'));
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { customer: sanitizeCustomer(req.customer) }));
});
