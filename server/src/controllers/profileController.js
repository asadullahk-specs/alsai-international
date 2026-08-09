const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const sanitize = (c) => ({
  id: c._id,
  fullName: c.fullName,
  email: c.email,
  phone: c.phone,
  cnic: c.cnic,
  gender: c.gender,
  dob: c.dob,
  avatar: c.avatar,
  createdAt: c.createdAt,
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, gender, dob, avatar } = req.body;
  const customer = await Customer.findById(req.customer._id);

  // CNIC and email are identity fields set at signup and left read-only here -
  // everything else on the profile form can be edited any time.
  if (fullName) customer.fullName = fullName;
  if (phone) customer.phone = phone;
  if (gender) customer.gender = gender;
  if (dob) customer.dob = dob;
  if (avatar !== undefined) customer.avatar = avatar;

  await customer.save();
  res.status(200).json(new ApiResponse(200, { customer: sanitize(customer) }, 'Profile updated'));
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Both current and new password are required');
  }
  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
    throw new ApiError(400, 'New password must be at least 8 characters and include an uppercase letter, a number, and a special character');
  }

  const customer = await Customer.findById(req.customer._id).select('+password');
  const isMatch = await customer.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  customer.password = newPassword;
  await customer.save();

  res.status(200).json(new ApiResponse(200, null, 'Password updated successfully'));
});
