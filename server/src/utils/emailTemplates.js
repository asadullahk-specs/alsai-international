const EmailTemplate = require('../models/EmailTemplate');
const { emailShell } = require('./sendEmail');

// Default content mirrors the reference admin design (Settings > Templates).
// These seed the database on first run; admins can edit everything afterwards.
const DEFAULTS = [
  {
    key: 'order_confirmation',
    name: 'Order Confirmation',
    subject: 'Thank you for your order! (Order #{{order_number}})',
    variables: [
      { token: '{{customer_name}}', label: 'Customer Name' },
      { token: '{{order_number}}', label: 'Order Number' },
      { token: '{{order_date}}', label: 'Order Date' },
      { token: '{{order_total}}', label: 'Order Total' },
      { token: '{{store_name}}', label: 'Store Name' },
    ],
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:#211D1A;margin-top:0;">Thank you for your order!</h2>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">Hi {{customer_name}},</p>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">We've received your order and it's now being processed.</p>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">Order Number: {{order_number}}<br/>Order Date: {{order_date}}<br/>Total: {{order_total}}</p>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">We will notify you once your order has been shipped.</p>
      <p style="color:#8a827a;font-size:12px;">Thank you for shopping with {{store_name}}!</p>
    `,
  },
  {
    key: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    variables: [
      { token: '{{customer_name}}', label: 'Customer Name' },
      { token: '{{reset_url}}', label: 'Reset Link' },
      { token: '{{store_name}}', label: 'Store Name' },
    ],
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:#211D1A;margin-top:0;">Reset Your Password</h2>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">Hello {{customer_name}},</p>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">We received a request to reset your password for your {{store_name}} account. Click the button below to reset it. This link will expire in 1 hour for your security.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{reset_url}}" style="background-color:#A9662A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:13px;letter-spacing:1px;display:inline-block;">RESET PASSWORD</a>
      </div>
      <p style="color:#8a827a;font-size:12px;line-height:1.6;">If you didn't request a password reset, please ignore this email.</p>
      <p style="color:#8a827a;font-size:12px;">Thank you,<br/>The {{store_name}} Team</p>
    `,
  },
  {
    key: 'newsletter',
    name: 'Newsletter',
    subject: 'Stay Scented, Stay Inspired',
    variables: [
      { token: '{{customer_name}}', label: 'Customer Name' },
      { token: '{{store_name}}', label: 'Store Name' },
      { token: '{{unsubscribe_url}}', label: 'Unsubscribe Link' },
    ],
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:#211D1A;margin-top:0;">Stay Scented, Stay Inspired</h2>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">Explore our latest collections, exclusive offers and fragrance stories - crafted just for you.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{store_name}}" style="background-color:#A9662A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:13px;letter-spacing:1px;display:inline-block;">EXPLORE NOW</a>
      </div>
      <p style="color:#8a827a;font-size:12px;">You're receiving this email because you subscribed to {{store_name}} updates. <a href="{{unsubscribe_url}}" style="color:#8a827a;">Unsubscribe</a></p>
    `,
  },
  {
    key: 'abandoned_cart',
    name: 'Abandoned Cart',
    subject: 'You Left Something Behind',
    variables: [
      { token: '{{customer_name}}', label: 'Customer Name' },
      { token: '{{cart_url}}', label: 'Cart Link' },
      { token: '{{cart_items}}', label: 'Cart Items Summary' },
      { token: '{{store_name}}', label: 'Store Name' },
    ],
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:#211D1A;margin-top:0;">You Left Something Behind</h2>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">Hi {{customer_name}},</p>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">It looks like you left some items in your cart. Don't miss out - they're still waiting for you!</p>
      <p style="color:#4a4440;font-size:14px;line-height:1.6;">{{cart_items}}</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{{cart_url}}" style="background-color:#A9662A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:13px;letter-spacing:1px;display:inline-block;">COMPLETE YOUR ORDER</a>
      </div>
      <p style="color:#8a827a;font-size:12px;">Need help? Just reply to this email and we'll be glad to assist.</p>
      <p style="color:#8a827a;font-size:12px;">Thank you,<br/>The {{store_name}} Team</p>
    `,
  },
];

const getDefault = (key) => DEFAULTS.find((d) => d.key === key);

const ensureSeeded = async () => {
  const existing = await EmailTemplate.find().select('key');
  const existingKeys = new Set(existing.map((e) => e.key));
  const missing = DEFAULTS.filter((d) => !existingKeys.has(d.key));
  if (missing.length) await EmailTemplate.insertMany(missing);
};

const substitute = (text, vars) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{{${k}}}`).join(v ?? ''), text);

// Fetches the (admin-editable) template from the database and renders it with
// the supplied variables, wrapped in the branded email shell. Falls back to
// the built-in default if the DB document is somehow missing.
const renderEmailTemplate = async (key, vars = {}) => {
  await ensureSeeded();
  let doc = await EmailTemplate.findOne({ key });
  if (!doc) doc = getDefault(key);

  const mergedVars = { store_name: "AL SA'I", ...vars };
  const subject = substitute(doc.subject, mergedVars);
  const html = emailShell(substitute(doc.bodyHtml, mergedVars));
  return { subject, html };
};

module.exports = { DEFAULTS, ensureSeeded, renderEmailTemplate };
