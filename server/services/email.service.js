const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const path = require('path');
const config = require('../config');

const hasProviderConfig = Boolean(
  config.emailHost &&
  config.emailPort &&
  config.emailUser &&
  config.emailPass &&
  config.emailFrom
);

const createTransporter = async () => {
  if (hasProviderConfig) {
    return nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailSecure,
      auth: {
        user: config.emailUser,
        pass: config.emailPass
      }
    });
  }

  if (config.nodeEnv !== 'production') {
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }

  throw new Error('Email provider is not configured in production.');
};

const saveDevEmail = async (to, subject, text, html) => {
  const outputDir = path.resolve(process.cwd(), 'dev-emails');
  await fs.mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `email-${Date.now()}.txt`);
  const content = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    text || '',
    html ? `\n${html}` : ''
  ].join('\n');
  await fs.writeFile(filePath, content, 'utf8');
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: config.emailFrom,
    to,
    subject,
    text,
    html
  });

  if (!hasProviderConfig && config.nodeEnv !== 'production') {
    await saveDevEmail(to, subject, text, html);
  }

  return info;
};

module.exports = {
  sendEmail
};
