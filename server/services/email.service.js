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

/**
 * Mask email for safe logging - keeps first char and domain, hides middle
 * user@example.com -> u***@example.com
 */
const maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  return `${localPart[0]}${'*'.repeat(Math.max(3, localPart.length - 2))}@${domain}`;
};

/**
 * Log SMTP configuration safely (never logs password)
 */
const logSmtpConfig = () => {
  if (hasProviderConfig) {
    console.log('[EMAIL] SMTP Configuration:', {
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailSecure,
      userPresent: Boolean(config.emailUser),
      from: config.emailFrom
    });
  } else {
    console.log('[EMAIL] Using development transport (no SMTP configured)');
  }
};

const createTransporter = async () => {
  if (hasProviderConfig) {
    logSmtpConfig();
    return nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailSecure,
      auth: {
        user: config.emailUser,
        pass: config.emailPass
      },
      family: 4
    });
  }

  if (config.nodeEnv !== 'production') {
    console.log('[EMAIL] Using development transport (jsonTransport)');
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
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      text,
      html
    });

    // Log successful send with masked email
    console.log('[EMAIL] Send success:', {
      recipient: maskEmail(to),
      subject,
      messageId: info.messageId,
      response: info.response
    });

    if (!hasProviderConfig && config.nodeEnv !== 'production') {
      await saveDevEmail(to, subject, text, html);
    }

    return info;
  } catch (error) {
    // Log error with full details for diagnostics
    console.error('[EMAIL] Send failed:', {
      recipient: maskEmail(to),
      subject,
      errorCode: error.code,
      errorMessage: error.message,
      errorCommand: error.command,
      errorResponse: error.response,
      hasProvider: hasProviderConfig,
      nodeEnv: config.nodeEnv
    });
    throw error;
  }
};

module.exports = {
  sendEmail,
  maskEmail
};
