const mongoose = require('mongoose');
const { User, Product, Chat, Message, Favorite, Promotion, SellerVerification, Review, Report, PageView, Search, Visitor, Transaction, Image, AuditLog, Admin } = require('../models');

const PROTECTED_ROLES = ['admin'];
const PROTECTED_EMAILS = ['dev-admin@example.com', 'admin@example.com'];
const DEFAULT_CONFIRMATION_TEXT = 'DELETE';

const normalizeUserId = (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  return null;
};

const inspectDependencies = async (userId) => {
  const [products, chats, messages, favorites, promotions, sellerVerifications, reviews, reports, pageViews, searches, visitors, transactions, images, auditLogs, admins] = await Promise.all([
    Product.countDocuments({ seller: userId }),
    Chat.countDocuments({ seller: userId }),
    Message.countDocuments({ sender: userId }),
    Favorite.countDocuments({ user: userId }),
    Promotion.countDocuments({ seller: userId }),
    SellerVerification.countDocuments({ userId }),
    Review.countDocuments({ seller: userId }),
    Report.countDocuments({ reporter: userId }),
    PageView.countDocuments({ userId, sellerId: userId }),
    Search.countDocuments({ userId }),
    Visitor.countDocuments({ userId }),
    Transaction.countDocuments({ seller: userId }),
    Image.countDocuments({ uploadedBy: userId }),
    AuditLog.countDocuments({ admin: userId }),
    Admin.countDocuments({ user: userId })
  ]);

  return {
    products,
    chats,
    messages,
    favorites,
    promotions,
    sellerVerifications,
    reviews,
    reports,
    pageViews,
    searches,
    visitors,
    transactions,
    images,
    auditLogs,
    admins
  };
};

const deleteDependencies = async (userId) => {
  const results = {
    deletedProductCount: 0,
    deletedChatCount: 0,
    deletedMessageCount: 0,
    deletedFavoriteCount: 0,
    deletedPromotionCount: 0,
    deletedSellerVerificationCount: 0,
    deletedReviewCount: 0,
    deletedReportCount: 0,
    deletedPageViewCount: 0,
    deletedSearchCount: 0,
    deletedVisitorCount: 0,
    deletedTransactionCount: 0,
    deletedImageCount: 0,
    deletedAuditLogCount: 0,
    deletedAdminCount: 0
  };

  const [productDelete, chatDelete, messageDelete, favoriteDelete, promotionDelete, sellerVerificationDelete, reviewDelete, reportDelete, pageViewDelete, searchDelete, visitorDelete, transactionDelete, imageDelete, auditLogDelete, adminDelete] = await Promise.all([
    Product.deleteMany({ seller: userId }),
    Chat.deleteMany({ seller: userId }),
    Message.deleteMany({ sender: userId }),
    Favorite.deleteMany({ user: userId }),
    Promotion.deleteMany({ seller: userId }),
    SellerVerification.deleteMany({ userId }),
    Review.deleteMany({ seller: userId }),
    Report.deleteMany({ reporter: userId }),
    PageView.deleteMany({ userId, sellerId: userId }),
    Search.deleteMany({ userId }),
    Visitor.deleteMany({ userId }),
    Transaction.deleteMany({ seller: userId }),
    Image.deleteMany({ uploadedBy: userId }),
    AuditLog.deleteMany({ admin: userId }),
    Admin.deleteMany({ user: userId })
  ]);

  results.deletedProductCount = productDelete.deletedCount || 0;
  results.deletedChatCount = chatDelete.deletedCount || 0;
  results.deletedMessageCount = messageDelete.deletedCount || 0;
  results.deletedFavoriteCount = favoriteDelete.deletedCount || 0;
  results.deletedPromotionCount = promotionDelete.deletedCount || 0;
  results.deletedSellerVerificationCount = sellerVerificationDelete.deletedCount || 0;
  results.deletedReviewCount = reviewDelete.deletedCount || 0;
  results.deletedReportCount = reportDelete.deletedCount || 0;
  results.deletedPageViewCount = pageViewDelete.deletedCount || 0;
  results.deletedSearchCount = searchDelete.deletedCount || 0;
  results.deletedVisitorCount = visitorDelete.deletedCount || 0;
  results.deletedTransactionCount = transactionDelete.deletedCount || 0;
  results.deletedImageCount = imageDelete.deletedCount || 0;
  results.deletedAuditLogCount = auditLogDelete.deletedCount || 0;
  results.deletedAdminCount = adminDelete.deletedCount || 0;

  return results;
};

const previewSellerDeletion = async ({ userId, actorId }) => {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    const error = new Error('A valid seller ID is required');
    error.statusCode = 400;
    throw error;
  }

  const seller = await User.findById(normalizedUserId).lean();
  if (!seller) {
    const error = new Error('Seller not found');
    error.statusCode = 404;
    throw error;
  }

  if (seller.role !== 'seller') {
    const error = new Error('Only seller accounts can be deleted through this flow');
    error.statusCode = 403;
    throw error;
  }

  if (PROTECTED_ROLES.includes(seller.role) || PROTECTED_EMAILS.includes(seller.email)) {
    const error = new Error('Protected account cannot be deleted');
    error.statusCode = 403;
    throw error;
  }

  if (actorId && seller._id.toString() === actorId.toString()) {
    const error = new Error('The currently authenticated admin cannot delete their own account');
    error.statusCode = 403;
    throw error;
  }

  const counts = await inspectDependencies(seller._id);
  return {
    userId: seller._id,
    displayName: seller.displayName,
    email: seller.email,
    role: seller.role,
    ...counts
  };
};

const deleteSellerAccount = async ({ userId, confirmation, actorId, skipConnect = false, confirmationText = DEFAULT_CONFIRMATION_TEXT }) => {
  if (typeof confirmation !== 'string' || confirmation.trim() !== confirmationText.trim()) {
    const error = new Error('Confirmation text did not match');
    error.statusCode = 400;
    throw error;
  }

  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    const error = new Error('A valid seller ID is required');
    error.statusCode = 400;
    throw error;
  }

  if (!skipConnect && mongoose.connection.readyState !== 1) {
    const error = new Error('Database connection is not ready');
    error.statusCode = 503;
    throw error;
  }

  const seller = await User.findById(normalizedUserId);
  if (!seller) {
    const error = new Error('Seller not found');
    error.statusCode = 404;
    throw error;
  }

  if (seller.role !== 'seller') {
    const error = new Error('Only seller accounts can be deleted through this flow');
    error.statusCode = 403;
    throw error;
  }

  if (PROTECTED_ROLES.includes(seller.role) || PROTECTED_EMAILS.includes(seller.email)) {
    const error = new Error('Protected account cannot be deleted');
    error.statusCode = 403;
    throw error;
  }

  if (actorId && seller._id.toString() === actorId.toString()) {
    const error = new Error('The currently authenticated admin cannot delete their own account');
    error.statusCode = 403;
    throw error;
  }

  const dependencyDeletes = await deleteDependencies(seller._id);
  const deleteResult = await User.deleteOne({ _id: seller._id });

  return {
    ...dependencyDeletes,
    deletedUserCount: deleteResult.deletedCount || 0,
    deleteOrder: ['Product', 'Chat', 'Message', 'Favorite', 'Promotion', 'SellerVerification', 'Review', 'Report', 'PageView', 'Search', 'Visitor', 'Transaction', 'Image', 'AuditLog', 'Admin', 'User'],
    userId: seller._id,
    displayName: seller.displayName,
    email: seller.email
  };
};

module.exports = {
  inspectDependencies,
  deleteDependencies,
  previewSellerDeletion,
  deleteSellerAccount,
  PROTECTED_ROLES,
  PROTECTED_EMAILS,
  DEFAULT_CONFIRMATION_TEXT
};
