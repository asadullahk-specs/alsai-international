const Role = require('../models/Role');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ createdAt: 1 });
  const counts = await Admin.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const withCounts = roles.map((r) => ({ ...r.toObject(), adminCount: countMap.get(String(r._id)) || 0 }));
  res.status(200).json(new ApiResponse(200, { roles: withCounts }));
});

exports.createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions } = req.body;
  if (!name) throw new ApiError(400, 'Role name is required');
  const role = await Role.create({ name, description, permissions: permissions || [] });
  await logActivity({ admin: req.admin._id, action: 'Created role', module: 'users', details: name });
  res.status(201).json(new ApiResponse(201, { role }, 'Role created'));
});

exports.updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found');
  if (role.isSystemRole && req.body.name && req.body.name !== role.name) {
    throw new ApiError(400, 'System roles cannot be renamed');
  }
  Object.assign(role, req.body);
  await role.save();
  await logActivity({ admin: req.admin._id, action: 'Updated role', module: 'users', details: role.name });
  res.status(200).json(new ApiResponse(200, { role }, 'Role updated'));
});

exports.deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found');
  if (role.isSystemRole) throw new ApiError(400, 'System roles cannot be deleted');

  const inUse = await Admin.countDocuments({ role: role._id });
  if (inUse > 0) throw new ApiError(400, `Cannot delete: ${inUse} admin(s) currently have this role`);

  await role.deleteOne();
  await logActivity({ admin: req.admin._id, action: 'Deleted role', module: 'users', details: role.name });
  res.status(200).json(new ApiResponse(200, null, 'Role deleted'));
});
