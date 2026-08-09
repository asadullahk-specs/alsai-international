const Address = require('../models/Address');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ customer: req.customer._id }).sort({ isDefault: -1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { addresses }));
});

exports.createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, addressLine, city, province, country, isDefault } = req.body;
  if (!fullName || !phone || !addressLine || !city) {
    throw new ApiError(400, 'Please complete all required fields');
  }

  if (isDefault) {
    await Address.updateMany({ customer: req.customer._id }, { isDefault: false });
  }

  const existingCount = await Address.countDocuments({ customer: req.customer._id });

  const address = await Address.create({
    customer: req.customer._id,
    fullName,
    phone,
    addressLine,
    city,
    province,
    country,
    isDefault: Boolean(isDefault) || existingCount === 0,
  });

  res.status(201).json(new ApiResponse(201, { address }, 'Address added'));
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!address) throw new ApiError(404, 'Address not found');

  const { fullName, phone, addressLine, city, province, country, isDefault } = req.body;
  if (isDefault) {
    await Address.updateMany({ customer: req.customer._id }, { isDefault: false });
  }

  if (fullName) address.fullName = fullName;
  if (phone) address.phone = phone;
  if (addressLine) address.addressLine = addressLine;
  if (city) address.city = city;
  if (province !== undefined) address.province = province;
  if (country) address.country = country;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await address.save();

  res.status(200).json(new ApiResponse(200, { address }, 'Address updated'));
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, customer: req.customer._id });
  if (!address) throw new ApiError(404, 'Address not found');
  res.status(200).json(new ApiResponse(200, null, 'Address removed'));
});

exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!address) throw new ApiError(404, 'Address not found');

  await Address.updateMany({ customer: req.customer._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  res.status(200).json(new ApiResponse(200, { address }, 'Default address updated'));
});
