const Admin = require('../models/Admin');
const Role = require('../models/Role');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().populate('role', 'name').sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { admins }));
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role) {
    throw new ApiError(400, 'Full name, email, password, and role are required');
  }
  const roleDoc = await Role.findById(role);
  if (!roleDoc) throw new ApiError(400, 'Selected role does not exist');

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(400, 'An admin with this email already exists');

  const admin = await Admin.create({ fullName, email, password, role });
  await logActivity({ admin: req.admin._id, action: 'Created admin user', module: 'users', details: email });

  const { password: _pw, ...safeAdmin } = admin.toObject();
  res.status(201).json(new ApiResponse(201, { admin: safeAdmin }, 'Admin user created'));
});

exports.updateAdmin = asyncHandler(async (req, res) => {
  const { fullName, role, isActive } = req.body;
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');

  if (String(admin._id) === String(req.admin._id) && isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  if (fullName) admin.fullName = fullName;
  if (role) admin.role = role;
  if (typeof isActive === 'boolean') admin.isActive = isActive;
  await admin.save();

  await logActivity({ admin: req.admin._id, action: 'Updated admin user', module: 'users', details: admin.email });
  res.status(200).json(new ApiResponse(200, { admin }, 'Admin updated'));
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.admin._id)) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');

  await logActivity({ admin: req.admin._id, action: 'Deleted admin user', module: 'users', details: admin.email });
  res.status(200).json(new ApiResponse(200, null, 'Admin deleted'));
});
