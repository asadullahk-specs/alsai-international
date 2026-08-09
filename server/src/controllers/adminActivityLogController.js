const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.listLogs = asyncHandler(async (req, res) => {
  const { admin, module: moduleFilter, startDate, endDate, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (admin) filter.admin = admin;
  if (moduleFilter && moduleFilter !== 'all') filter.module = moduleFilter;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [logs, total, modules] = await Promise.all([
    ActivityLog.find(filter)
      .populate('admin', 'fullName')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ActivityLog.countDocuments(filter),
    ActivityLog.distinct('module'),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      logs,
      modules,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.exportLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().populate('admin', 'fullName').sort({ createdAt: -1 }).limit(2000);
  const rows = [['Date & Time', 'Admin', 'Action', 'Module', 'Details']];
  logs.forEach((l) => {
    rows.push([new Date(l.createdAt).toISOString(), l.admin?.fullName || 'System', l.action, l.module, l.details]);
  });
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
  res.status(200).send(csv);
});
