const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/generateTokens');
const Admin = require('../models/Admin');

const protectAdmin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyToken(token, process.env.JWT_ADMIN_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired session');
  }

  const admin = await Admin.findById(decoded.sub).populate('role');
  if (!admin || !admin.isActive) {
    throw new ApiError(401, 'Account not found or inactive');
  }

  req.admin = admin;
  next();
});

module.exports = protectAdmin;
