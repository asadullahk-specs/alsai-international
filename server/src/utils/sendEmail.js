const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const fromName = process.env.EMAIL_FROM_NAME || "AL SA'I";
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'no-reply@alsai.com';

  if (!process.env.SMTP_HOST) {
    console.warn('[sendEmail] SMTP_HOST is not set - skipping real delivery. Configure SMTP in .env to send real emails.');
    console.info(`[sendEmail] Would have sent "${subject}" to ${to}`);
    return;
  }

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    html,
  });
};

const emailShell = (bodyHtml) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#FAF6F0;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background-color:#141210;padding:28px;text-align:center;">
                <span style="color:#C9A15A;font-size:22px;letter-spacing:3px;font-family:Georgia,serif;">AL SA'I</span>
                <div style="color:#C9A15A;font-size:10px;letter-spacing:3px;margin-top:2px;">EXTRAIT DE PARFUM</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px;">${bodyHtml}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const passwordResetTemplate = (name, resetUrl) =>
  emailShell(`
    <h2 style="font-family:Georgia,serif;color:#211D1A;margin-top:0;">Reset Your Password</h2>
    <p style="color:#4a4440;font-size:14px;line-height:1.6;">Hello ${name},</p>
    <p style="color:#4a4440;font-size:14px;line-height:1.6;">We received a request to reset your AL SA'I account password. Click the button below to choose a new one. This link expires in 1 hour.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="background-color:#A9662A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:13px;letter-spacing:1px;display:inline-block;">RESET PASSWORD</a>
    </div>
    <p style="color:#8a827a;font-size:12px;line-height:1.6;">If you didn't request this, you can safely ignore this email - your password will remain unchanged.</p>
    <p style="color:#8a827a;font-size:12px;">Thank you,<br/>The AL SA'I Team</p>
  `);

module.exports = { sendEmail, passwordResetTemplate, emailShell };
