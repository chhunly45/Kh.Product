const adminService = require('../services/admin.service');
const emailService = require('../services/email.service');
const config = require('../config');

const getOverview = async (req, res, next) => {
  try {
    const overview = await adminService.getOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await adminService.listUsers(req.query);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserStatus(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const products = await adminService.listProducts(req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const product = await adminService.updateProductStatus(req.params.id, req.body.status);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const listReports = async (req, res, next) => {
  try {
    const reports = await adminService.listReports(req.query);
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const report = await adminService.updateReportStatus(req.params.id, req.body.status, req.user.id);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const sendTestEmail = async (req, res, next) => {
  try {
    // Only allow in development environment or explicitly enabled
    if (config.nodeEnv === 'production' && process.env.ENABLE_EMAIL_TEST !== 'true') {
      const error = new Error('Test email endpoint is disabled in production');
      error.statusCode = 403;
      throw error;
    }

    const { to } = req.body;
    if (!to) {
      const error = new Error('Email address required in request body: { to: "email@example.com" }');
      error.statusCode = 400;
      throw error;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      const error = new Error('Invalid email address format');
      error.statusCode = 400;
      throw error;
    }

    console.log(`[EMAIL] Test email initiated by admin ${req.user.id} for recipient: ${emailService.maskEmail(to)}`);

    await emailService.sendEmail({
      to,
      subject: 'Marketplace Kh - Test Email',
      text: 'This is a test email from your Marketplace Kh backend. If you received this, email delivery is working correctly.',
      html: '<p>This is a test email from your Marketplace Kh backend.</p><p>If you received this, email delivery is working correctly.</p>'
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        recipient: emailService.maskEmail(to),
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  listUsers,
  updateUserStatus,
  listProducts,
  updateProductStatus,
  listReports,
  updateReportStatus,
  sendTestEmail
};
