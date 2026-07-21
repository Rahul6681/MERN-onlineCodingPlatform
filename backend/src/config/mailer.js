const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Mailer Mock]: Email to ${to} | Subject: "${subject}" | Content: ${text || 'HTML Content'}`);
    return { success: true, mocked: true };
  }
  try {
    const info = await transporter.sendMail({
      from: '"CodeArena Platform" <no-reply@codearena.dev>',
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer Error]:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
