const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['order_confirmation', 'password_reset', 'newsletter', 'abandoned_cart'],
    },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    bodyHtml: { type: String, required: true },
    variables: [{ token: String, label: String, _id: false }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
