const EmailTemplate = require('../models/EmailTemplate');
const { DEFAULTS, ensureSeeded } = require('../utils/emailTemplates');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listTemplates = asyncHandler(async (req, res) => {
  await ensureSeeded();
  const templates = await EmailTemplate.find().sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, { templates }));
});

exports.getTemplate = asyncHandler(async (req, res) => {
  await ensureSeeded();
  const template = await EmailTemplate.findOne({ key: req.params.key });
  if (!template) throw new ApiError(404, 'Template not found');
  res.status(200).json(new ApiResponse(200, { template }));
});

exports.updateTemplate = asyncHandler(async (req, res) => {
  const { name, subject, bodyHtml } = req.body;
  const template = await EmailTemplate.findOneAndUpdate(
    { key: req.params.key },
    { $set: { name, subject, bodyHtml } },
    { new: true, runValidators: true }
  );
  if (!template) throw new ApiError(404, 'Template not found');
  await logActivity({ admin: req.admin._id, action: `Updated "${template.name}" email template`, module: 'settings', details: '' });
  res.status(200).json(new ApiResponse(200, { template }, 'Template saved'));
});

exports.resetTemplate = asyncHandler(async (req, res) => {
  const fallback = DEFAULTS.find((d) => d.key === req.params.key);
  if (!fallback) throw new ApiError(404, 'Template not found');
  const template = await EmailTemplate.findOneAndUpdate(
    { key: req.params.key },
    { $set: { name: fallback.name, subject: fallback.subject, bodyHtml: fallback.bodyHtml, variables: fallback.variables } },
    { new: true, upsert: true }
  );
  await logActivity({ admin: req.admin._id, action: `Reset "${template.name}" email template to default`, module: 'settings', details: '' });
  res.status(200).json(new ApiResponse(200, { template }, 'Template reset to default'));
});
