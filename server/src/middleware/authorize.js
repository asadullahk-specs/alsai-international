const ApiError = require('../utils/ApiError');

// Usage: router.put('/products/:id', protectAdmin, authorize('products', 'edit'), controller.update)
const authorize = (moduleName, action) => (req, res, next) => {
  const role = req.admin?.role;
  if (!role) throw new ApiError(403, 'Access denied');

  if (role.name === 'Super Admin') return next();

  const permission = role.permissions.find((p) => p.module === moduleName);
  if (!permission || !permission.actions.includes(action)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }

  next();
};

module.exports = authorize;
