const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ admin, action, module, details = '', ipAddress = '' }) => {
  try {
    await ActivityLog.create({ admin, action, module, details, ipAddress });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = logActivity;
