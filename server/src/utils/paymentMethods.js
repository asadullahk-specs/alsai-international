const Settings = require('../models/Settings');

// The new Payments tab must offer only the payment methods already
// configured as enabled in Settings > Payment, rather than its own
// hardcoded list.
const getEnabledPaymentMethods = async () => {
  const settings = await Settings.findOne().select('payment');
  const payment = settings?.payment || {};

  const methods = [];
  if (payment.codEnabled) methods.push({ value: 'cod', label: 'Cash on Delivery' });
  if (payment.bankTransferEnabled) methods.push({ value: 'bank_transfer', label: 'Bank Transfer' });
  if (payment.easyPaisaEnabled) methods.push({ value: 'easypaisa', label: 'EasyPaisa' });
  if (payment.jazzCashEnabled) methods.push({ value: 'jazzcash', label: 'JazzCash' });

  // Always keep a manual/other fallback so a purchase/expense/payment can
  // still be recorded even if no online method is enabled yet.
  methods.push({ value: 'cash', label: 'Cash' });
  methods.push({ value: 'other', label: 'Other' });

  return methods;
};

module.exports = getEnabledPaymentMethods;
