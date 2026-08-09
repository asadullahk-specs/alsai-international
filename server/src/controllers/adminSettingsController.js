const Settings = require('../models/Settings');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

const getOrCreate = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();
  res.status(200).json(new ApiResponse(200, { settings }));
});

const makeSectionUpdater = (section, activityLabel) =>
  asyncHandler(async (req, res) => {
    const settings = await getOrCreate();
    settings[section] = { ...settings[section]?.toObject?.(), ...req.body };
    await settings.save();
    await logActivity({ admin: req.admin._id, action: `Updated ${activityLabel} settings`, module: 'settings', details: '' });
    res.status(200).json(new ApiResponse(200, { settings }, `${activityLabel} settings saved`));
  });

exports.updateGeneral = makeSectionUpdater('general', 'General');
exports.updateShipping = makeSectionUpdater('shipping', 'Shipping');
exports.updatePayment = makeSectionUpdater('payment', 'Payment');
exports.updatePricing = makeSectionUpdater('pricing', 'Pricing');
exports.updateEmail = makeSectionUpdater('email', 'Email');
exports.updateSecurity = makeSectionUpdater('security', 'Security');
