const { User, Product, Chat, Report } = require('../models');
const notificationService = require('./notification.service');

const getOverview = async () => {
  const [users, products, chats, reports] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Chat.countDocuments(),
    Report.countDocuments({ status: 'pending' })
  ]);
  return { totalUsers: users, totalProducts: products, totalChats: chats, pendingReports: reports };
};

const listUsers = async ({ role, page = 1, limit = 25 }) => {
  const query = {};
  if (role) query.role = role;
  const skip = (Number(page) - 1) * Number(limit);
  const items = await User.find(query).select('-passwordHash -refreshTokens').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  const total = await User.countDocuments(query);
  return { items, meta: { page: Number(page), limit: Number(limit), total } };
};

const updateUserStatus = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.role) user.role = updates.role;
  if (updates.isActive !== undefined) user.isActive = updates.isActive;
  if (updates.verified !== undefined) {
    user.verified = updates.verified;
    user.verificationStatus = updates.verified ? 'approved' : updates.verificationStatus || 'rejected';
  }

  if (updates.verificationStatus) {
    user.verificationStatus = updates.verificationStatus;
    if (updates.verificationStatus === 'approved') {
      user.verified = true;
    }
    if (updates.verificationStatus === 'rejected') {
      user.verified = false;
    }
    if (updates.verificationStatus === 'pending') {
      user.verified = false;
    }
  }

  await user.save();

  if (updates.verificationStatus && ['approved', 'rejected'].includes(updates.verificationStatus)) {
    await notificationService.addNotification(user._id, {
      type: 'verification',
      title: `Verification ${updates.verificationStatus}`,
      message: updates.verificationStatus === 'approved'
        ? 'Your seller verification request has been approved.'
        : 'Your seller verification request has been rejected.',
      link: '/profile'
    });
  }

  return user;
};

const listProducts = async ({ status, page = 1, limit = 25 }) => {
  const query = {};
  if (status) query.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const items = await Product.find(query).populate('seller', 'displayName email').populate('category', 'name').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  const total = await Product.countDocuments(query);
  return { items, meta: { page: Number(page), limit: Number(limit), total } };
};

const updateProductStatus = async (productId, status) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  product.status = status;
  await product.save();
  return product;
};

const listReports = async ({ status, page = 1, limit = 25 }) => {
  const query = {};
  if (status) query.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const items = await Report.find(query).populate('reporter', 'displayName email').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  const total = await Report.countDocuments(query);
  return { items, meta: { page: Number(page), limit: Number(limit), total } };
};

const updateReportStatus = async (reportId, status, adminId) => {
  const report = await Report.findById(reportId);
  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }
  report.status = status;
  report.handledBy = adminId;
  await report.save();
  return report;
};

module.exports = {
  getOverview,
  listUsers,
  updateUserStatus,
  listProducts,
  updateProductStatus,
  listReports,
  updateReportStatus
};
