const mongoose = require('mongoose');

// A single settings document holds every admin-configurable store setting.
// Kept as one doc (like HomepageContent/WebsiteContent) since there's only
// ever one active configuration.
const settingsSchema = new mongoose.Schema(
  {
    general: {
      websiteName: { type: String, default: "AL SA'I" },
      storeEmail: { type: String, default: '' },
      currency: { type: String, default: 'PKR' },
      language: { type: String, default: 'English' },
      timezone: { type: String, default: 'Asia/Karachi' },
      maintenanceMode: { type: Boolean, default: false },
      allowCustomerRegistration: { type: Boolean, default: true },
    },
    shipping: {
      deliveryChargePKR: { type: Number, default: 250 },
      freeShippingThresholdPKR: { type: Number, default: 10000 },
      codAvailable: { type: Boolean, default: true },
      estimatedDeliveryTime: { type: String, default: '2-3 Business Days' },
      deliveryAreas: [
        {
          city: { type: String, required: true },
          chargePKR: { type: Number, required: true },
          available: { type: Boolean, default: true },
          _id: false,
        },
      ],
    },
    payment: {
      codEnabled: { type: Boolean, default: true },
      codInstructions: { type: String, default: 'Pay upon delivery of your order.' },
      bankTransferEnabled: { type: Boolean, default: false },
      bankTransferInstructions: { type: String, default: '' },
      easyPaisaEnabled: { type: Boolean, default: false },
      jazzCashEnabled: { type: Boolean, default: false },
      merchantNumbers: { easyPaisa: { type: String, default: '' }, jazzCash: { type: String, default: '' } },
    },
    pricing: {
      taxEnabled: { type: Boolean, default: false },
      taxRatePercent: { type: Number, default: 0 },
      taxLabel: { type: String, default: 'Sales Tax' },
      pricesIncludeTax: { type: Boolean, default: true },
      currencySymbol: { type: String, default: 'PKR' },
      currencyPosition: { type: String, enum: ['before', 'after'], default: 'before' },
      priceRounding: { type: String, enum: ['none', 'nearest10', 'nearest100'], default: 'none' },
      showCompareAtPrice: { type: Boolean, default: true },
      defaultProfitMarginPercent: { type: Number, default: 40 },
    },
    email: {
      smtpHost: { type: String, default: '' },
      smtpPort: { type: Number, default: 587 },
      encryption: { type: String, enum: ['TLS', 'SSL', 'None'], default: 'TLS' },
      fromEmail: { type: String, default: '' },
      fromName: { type: String, default: "AL SA'I" },
      notifyOnOrder: { type: Boolean, default: true },
      notifyOnNewCustomer: { type: Boolean, default: true },
      notifyOnLowStock: { type: Boolean, default: true },
      notifyOnAbandonedCart: { type: Boolean, default: false },
      notifyNewsletter: { type: Boolean, default: true },
    },
    security: {
      minPasswordLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireNumber: { type: Boolean, default: true },
      requireSpecialChar: { type: Boolean, default: false },
      failedLoginLimit: { type: Number, default: 5 },
      accountLockMinutes: { type: Number, default: 30 },
      adminSessionTimeoutMinutes: { type: Number, default: 30 },
      customerSessionTimeoutDays: { type: Number, default: 7 },
      rememberMeDays: { type: Number, default: 30 },
      twoFactorEnabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
