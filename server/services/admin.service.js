const { User, Product, Chat, Report, Image } = require('../models');
const mongoose = require('mongoose');
const notificationService = require('./notification.service');

const sellerBackfillFields = 'displayName profileImageUrl avatar email phoneNumber sellerVerificationStatus';

const findFallbackSeller = async (product) => {
  const fallbackUserId = product.createdBy || product.user;
  if (fallbackUserId && mongoose.Types.ObjectId.isValid(fallbackUserId)) {
    const fallbackUser = await User.findById(fallbackUserId).select(sellerBackfillFields).lean();
    if (fallbackUser) return fallbackUser;
  }

  const image = await Image.findOne({ product: product._id }).sort({ sortOrder: 1 }).select('uploadedBy').lean();
  if (image?.uploadedBy && mongoose.Types.ObjectId.isValid(image.uploadedBy)) {
    const uploader = await User.findById(image.uploadedBy).select(sellerBackfillFields).lean();
    if (uploader) return uploader;
  }

  return null;
};

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

  if (updates.sellerVerificationStatus) {
    user.sellerVerificationStatus = updates.sellerVerificationStatus;
    // keep verified boolean in sync for backward compatibility
    if (updates.sellerVerificationStatus === 'verified') user.verified = true;
    if (updates.sellerVerificationStatus === 'rejected') user.verified = false;
    if (updates.sellerVerificationStatus === 'unverified') user.verified = false;
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

  if (updates.sellerVerificationStatus && ['verified', 'rejected', 'unverified'].includes(updates.sellerVerificationStatus)) {
    await notificationService.addNotification(user._id, {
      type: 'seller_verification',
      title: `Seller ${updates.sellerVerificationStatus}`,
      message: updates.sellerVerificationStatus === 'verified'
        ? 'Your seller verification has been approved.'
        : updates.sellerVerificationStatus === 'rejected'
        ? 'Your seller verification has been rejected.'
        : 'Your seller verification status has been reset to unverified.',
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

const updateProductFeatured = async (productId, featured) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  product.featured = Boolean(featured);
  product.isFeatured = Boolean(featured);
  product.featuredAt = product.featured ? new Date() : null;
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

const backfillProductSellers = async () => {
  const products = await Product.find({ $or: [{ seller: { $exists: false } }, { seller: null }] }).select('_id createdBy user').lean();
  const scannedCount = products.length;
  let updatedCount = 0;

  for (const product of products) {
    const fallbackSeller = await findFallbackSeller(product);
    if (!fallbackSeller) continue;

    await Product.updateOne({ _id: product._id }, { seller: fallbackSeller._id });
    updatedCount += 1;
  }

  return { scannedCount, updatedCount };
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

const getProductsByProvince = async () => {
  const { provinces } = require('../config/provinces');
  const aggregation = await Product.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$province', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const result = aggregation.map((item) => {
    const province = provinces.find((p) => p.id === item._id);
    return {
      provinceId: item._id,
      provinceName: province?.name || 'Unknown',
      productCount: item.count
    };
  });

  return result;
};

module.exports = {
  getOverview,
  listUsers,
  updateUserStatus,
  listProducts,
  updateProductStatus,
  updateProductFeatured,
  listReports,
  backfillProductSellers,
  updateReportStatus,
  getProductsByProvince
};
