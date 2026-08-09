const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/generateTokens');
const Customer = require('../models/Customer');

const protectCustomer = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyToken(token, process.env.JWT_CUSTOMER_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired session');
  }

  const customer = await Customer.findById(decoded.sub);
  if (!customer || customer.status !== 'active') {
    throw new ApiError(401, 'Account not found or inactive');
  }

  req.customer = customer;
  next();
});

module.exports = protectCustomer;
