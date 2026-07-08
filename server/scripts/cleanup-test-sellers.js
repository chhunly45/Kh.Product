#!/usr/bin/env node
const path = require('path');
const readline = require('node:readline');
const dotenvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });

const mongoose = require('mongoose');

const PROTECTED_ROLES = ['admin'];
const PROTECTED_EMAILS = ['dev-admin@example.com', 'admin@example.com'];

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');
const toObjectId = (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return null;
};

const parseArgs = (argv = process.argv.slice(2)) => {
  const result = {
    emailTargets: [],
    idTargets: [],
    confirmDelete: false,
    confirmationText: 'DELETE TEST SELLERS',
    skipConnect: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--email') {
      const value = argv[index + 1];
      if (value) {
        result.emailTargets.push(normalizeEmail(value));
        index += 1;
      }
    } else if (arg === '--id') {
      const value = argv[index + 1];
      if (value) {
        result.idTargets.push(value);
        index += 1;
      }
    } else if (arg === '--confirm-delete') {
      result.confirmDelete = true;
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    }
  }

  return result;
};

const printUsage = () => {
  console.log('Usage:');
  console.log('  npm run cleanup:test-sellers -- --email test1@example.com --email test2@example.com');
  console.log('  npm run cleanup:test-sellers -- --id USER_ID --id USER_ID --confirm-delete');
  console.log('Safety: default mode is dry run. Destructive mode requires --confirm-delete and exact typed confirmation.');
};

const ensureMongoEnvironment = (stderr = process.stderr) => {
  const mongoEnvName = process.env.MONGODB_URI ? 'MONGODB_URI' : process.env.MONGO_URI ? 'MONGO_URI' : null;
  const mongoEnvValue = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoEnvName || !mongoEnvValue) {
    stderr.write('MongoDB environment variable is not set. Aborting.\n');
    return { aborted: true, reason: 'mongo-env-missing' };
  }

  return { aborted: false, mongoEnvName };
};

const loadCleanupDependencies = () => {
  const connectDatabase = require('../config/database');
  const { User, Product, Chat, Message, Favorite, Promotion, SellerVerification, Review, Report, PageView, Search, Visitor, Transaction, Image, AuditLog, Admin } = require('../models');

  return {
    connectDatabase,
    User,
    Product,
    Chat,
    Message,
    Favorite,
    Promotion,
    SellerVerification,
    Review,
    Report,
    PageView,
    Search,
    Visitor,
    Transaction,
    Image,
    AuditLog,
    Admin
  };
};

const buildAbortResult = (reason, extra = {}) => ({
  aborted: true,
  reason,
  dryRun: false,
  deletedUserCount: 0,
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
  deletedAdminCount: 0,
  deleteOrder: [],
  ...extra
});

const verifyDatabaseAccess = async (stdout, stderr) => {
  if (mongoose.connection.readyState !== 1) {
    stderr.write('Database connection is not ready. Aborting.\n');
    return { aborted: true, reason: 'database-not-ready' };
  }

  const databaseName = mongoose.connection.name || mongoose.connection.db?.databaseName;
  if (!databaseName) {
    stderr.write('Unable to resolve active database name. Aborting.\n');
    return { aborted: true, reason: 'database-name-unresolved' };
  }

  let userCount;
  try {
    userCount = await mongoose.connection.collection('users').countDocuments();
  } catch (error) {
    stderr.write('Unable to read User collection count. Aborting.\n');
    return { aborted: true, reason: 'user-count-unavailable' };
  }

  stdout.write(`Database: ${databaseName}\n`);
  stdout.write(`User count: ${userCount}\n`);
  return { aborted: false, databaseName, userCount };
};

const printUserSummary = (users) => {
  if (!users || users.length === 0) {
    console.log('No matched users.');
    return;
  }

  console.log('Matched target accounts:');
  users.forEach((user) => {
    console.log(`- id=${user._id} email=${user.email || '-'} name=${user.displayName || '-'} role=${user.role || '-'} status=${user.isActive === false ? 'inactive' : 'active'}`);
  });
};

const readConfirmationText = async (stream, outputStream = process.stdout) => {
  if (!stream) {
    return '';
  }

  if (typeof stream.isTTY === 'boolean' && stream.isTTY && outputStream && typeof outputStream.write === 'function') {
    try {
      const rl = readline.createInterface({ input: stream, output: outputStream, terminal: true });
      try {
        const answer = await new Promise((resolve, reject) => {
          let settled = false;
          const finalize = (value) => {
            if (settled) {
              return;
            }
            settled = true;
            resolve(value);
          };
          rl.question('', (input) => finalize(typeof input === 'string' ? input : ''));
          rl.once('error', (error) => finalize(''));
          rl.once('close', () => finalize(''));
        });
        return typeof answer === 'string' ? answer.trim() : '';
      } finally {
        rl.close();
      }
    } catch (error) {
      // Fall back to the stream-based reader for test doubles or non-tty-like streams.
    }
  }

  if (typeof stream.read === 'function') {
    const value = stream.read();
    return typeof value === 'string' ? value.trim() : '';
  }

  if (typeof stream.value === 'string') {
    const value = stream.value;
    stream.value = '';
    return value.trim();
  }

  if (typeof stream.once !== 'function') {
    return '';
  }

  stream.resume?.();
  stream.setEncoding?.('utf8');

  return new Promise((resolve) => {
    stream.once('data', (input) => {
      const text = typeof input === 'string' ? input.trim() : input?.toString?.().trim() || '';
      resolve(text);
    });
  });
};

const inspectDependencies = async (userId, dependencies = {}) => {
  const { Product, Chat, Message, Favorite, Promotion, SellerVerification, Review, Report, PageView, Search, Visitor, Transaction, Image, AuditLog, Admin } = dependencies;
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

const deleteDependencies = async (userId, dependencies = {}) => {
  const { Product, Chat, Message, Favorite, Promotion, SellerVerification, Review, Report, PageView, Search, Visitor, Transaction, Image, AuditLog, Admin } = dependencies;
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

const cleanupTestSellers = async ({
  emailTargets = [],
  idTargets = [],
  confirmDelete = false,
  confirmationText = 'DELETE TEST SELLERS',
  skipConnect = false,
  stdin = process.stdin,
  stdout = process.stdout,
  stderr = process.stderr
} = {}) => {
  const normalizedEmailTargets = emailTargets.map(normalizeEmail).filter(Boolean);
  const normalizedIdTargets = idTargets.filter(Boolean);

  if (!normalizedEmailTargets.length && !normalizedIdTargets.length) {
    printUsage();
    return buildAbortResult('no-targets');
  }

  const mongoEnvCheck = ensureMongoEnvironment(stderr);
  if (mongoEnvCheck.aborted) {
    return buildAbortResult(mongoEnvCheck.reason);
  }

  const dependencies = loadCleanupDependencies();
  const { connectDatabase, User, Product, Chat, Message, Favorite, Promotion, SellerVerification, Review, Report, PageView, Search, Visitor, Transaction, Image, AuditLog, Admin } = dependencies;

  if (!skipConnect) {
    try {
      await connectDatabase({ exitOnError: false });
    } catch (error) {
      stderr.write('Database connection failed. Aborting.\n');
      return buildAbortResult('database-connect-failed');
    }
  } else if (mongoose.connection.readyState !== 1) {
    stderr.write('Database connection is not ready. Aborting.\n');
    return buildAbortResult('database-not-ready');
  }

  const verification = await verifyDatabaseAccess(stdout, stderr);
  if (verification.aborted) {
    return buildAbortResult(verification.reason);
  }

  const matchedUsers = [];
  const startupVerification = verification;
  const unmatchedTargets = [];
  const protectedTargets = [];
  const targetUserIds = [];

  for (const email of normalizedEmailTargets) {
    const user = await User.findOne({ email }).lean();
    if (!user) {
      unmatchedTargets.push({ type: 'email', value: email });
      continue;
    }
    matchedUsers.push(user);
    targetUserIds.push(user._id);
  }

  for (const id of normalizedIdTargets) {
    const objectId = toObjectId(id);
    if (!objectId) {
      unmatchedTargets.push({ type: 'id', value: id });
      continue;
    }
    const user = await User.findById(objectId).lean();
    if (!user) {
      unmatchedTargets.push({ type: 'id', value: id });
      continue;
    }
    if (!matchedUsers.some((candidate) => candidate._id.toString() === user._id.toString())) {
      matchedUsers.push(user);
      targetUserIds.push(user._id);
    }
  }

  const resolvedUsers = [];
  for (const user of matchedUsers) {
    if (PROTECTED_ROLES.includes(user.role) || PROTECTED_EMAILS.includes(user.email)) {
      protectedTargets.push(user);
      continue;
    }
    resolvedUsers.push(user);
  }

  stdout.write('=== Cleanup Test Sellers ===\n');
  if (normalizedEmailTargets.length || normalizedIdTargets.length) {
    stdout.write(`Requested emails/IDs: ${[...normalizedEmailTargets, ...normalizedIdTargets].join(', ')}\n`);
  }
  if (unmatchedTargets.length) {
    stdout.write('Unmatched requested targets:\n');
    unmatchedTargets.forEach((target) => stdout.write(`- ${target.type}: ${target.value}\n`));
  }
  printUserSummary(resolvedUsers);

  if (protectedTargets.length) {
    stdout.write('Protected targets skipped:\n');
    protectedTargets.forEach((user) => stdout.write(`- id=${user._id} email=${user.email || '-'} role=${user.role || '-'}\n`));
  }

  const dependencyReport = [];
  for (const user of resolvedUsers) {
    const counts = await inspectDependencies(user._id, dependencies);
    dependencyReport.push({ userId: user._id, counts });
    stdout.write(`Dependency report for ${user.email || user._id}:\n`);
    stdout.write(`- products=${counts.products} chats=${counts.chats} messages=${counts.messages} favorites=${counts.favorites} promotions=${counts.promotions}\n`);
    stdout.write(`- sellerVerifications=${counts.sellerVerifications} reviews=${counts.reviews} reports=${counts.reports} pageViews=${counts.pageViews} searches=${counts.searches} visitors=${counts.visitors}\n`);
    stdout.write(`- transactions=${counts.transactions} images=${counts.images} auditLogs=${counts.auditLogs} admins=${counts.admins}\n`);
  }

  if (!confirmDelete) {
    stdout.write('DRY RUN — NO RECORDS DELETED\n');
    return {
      aborted: false,
      dryRun: true,
      targetUserIds,
      unmatchedTargets,
      protectedTargets,
      dependencyReport,
      deletedUserCount: 0,
      deletedProductCount: 0,
      deletedChatCount: 0,
      deletedMessageCount: 0,
      deletedFavoriteCount: 0,
      deletedPromotionCount: 0,
      deletedSellerVerificationCount: 0,
      deletedReviewCount: 0,
      deletedReportCount: 0,
      deletedReportCount: 0,
      deletedPageViewCount: 0,
      deletedSearchCount: 0,
      deletedVisitorCount: 0,
      deletedTransactionCount: 0,
      deletedImageCount: 0,
      deletedAuditLogCount: 0,
      deletedAdminCount: 0,
      deleteOrder: [],
      databaseName: startupVerification?.databaseName,
      userCount: startupVerification?.userCount
    };
  }

  if (!stdin?.isTTY || !stdout?.isTTY) {
    stderr.write('Destructive mode requires an interactive terminal. Aborting.\n');
    return buildAbortResult('non-interactive');
  }

  stdout.write('Before deletion, type the exact confirmation text to proceed:\n');
  stdout.write(`${confirmationText}\n`);
  const answer = await readConfirmationText(stdin, stdout);
  const normalizedAnswer = typeof answer === 'string' ? answer.trim() : '';
  const normalizedConfirmationText = typeof confirmationText === 'string' ? confirmationText.trim() : '';

  if (normalizedAnswer !== normalizedConfirmationText) {
    stdout.write('Confirmation text did not match. Aborting destructive mode.\n');
    return buildAbortResult('confirmation-mismatch');
  }

  const deleteOrder = ['Product', 'Chat', 'Message', 'Favorite', 'Promotion', 'SellerVerification', 'Review', 'Report', 'PageView', 'Search', 'Visitor', 'Transaction', 'Image', 'AuditLog', 'Admin', 'User'];
  const summary = {
    deletedUserCount: 0,
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
    deletedAdminCount: 0,
    deleteOrder
  };

  for (const user of resolvedUsers) {
    const dependencyDeletes = await deleteDependencies(user._id, dependencies);
    Object.assign(summary, {
      deletedProductCount: summary.deletedProductCount + dependencyDeletes.deletedProductCount,
      deletedChatCount: summary.deletedChatCount + dependencyDeletes.deletedChatCount,
      deletedMessageCount: summary.deletedMessageCount + dependencyDeletes.deletedMessageCount,
      deletedFavoriteCount: summary.deletedFavoriteCount + dependencyDeletes.deletedFavoriteCount,
      deletedPromotionCount: summary.deletedPromotionCount + dependencyDeletes.deletedPromotionCount,
      deletedSellerVerificationCount: summary.deletedSellerVerificationCount + dependencyDeletes.deletedSellerVerificationCount,
      deletedReviewCount: summary.deletedReviewCount + dependencyDeletes.deletedReviewCount,
      deletedReportCount: summary.deletedReportCount + dependencyDeletes.deletedReportCount,
      deletedPageViewCount: summary.deletedPageViewCount + dependencyDeletes.deletedPageViewCount,
      deletedSearchCount: summary.deletedSearchCount + dependencyDeletes.deletedSearchCount,
      deletedVisitorCount: summary.deletedVisitorCount + dependencyDeletes.deletedVisitorCount,
      deletedTransactionCount: summary.deletedTransactionCount + dependencyDeletes.deletedTransactionCount,
      deletedImageCount: summary.deletedImageCount + dependencyDeletes.deletedImageCount,
      deletedAuditLogCount: summary.deletedAuditLogCount + dependencyDeletes.deletedAuditLogCount,
      deletedAdminCount: summary.deletedAdminCount + dependencyDeletes.deletedAdminCount
    });

    const deleteResult = await User.deleteOne({ _id: user._id });
    summary.deletedUserCount += deleteResult.deletedCount || 0;
  }

  stdout.write('Summary:\n');
  stdout.write(`- deletedUsers=${summary.deletedUserCount}\n`);
  stdout.write(`- deletedProducts=${summary.deletedProductCount}\n`);
  stdout.write(`- deletedChats=${summary.deletedChatCount}\n`);
  stdout.write(`- deletedMessages=${summary.deletedMessageCount}\n`);
  stdout.write(`- deletedFavorites=${summary.deletedFavoriteCount}\n`);
  stdout.write(`- deletedPromotions=${summary.deletedPromotionCount}\n`);
  stdout.write(`- deletedSellerVerifications=${summary.deletedSellerVerificationCount}\n`);
  stdout.write(`- deletedReviews=${summary.deletedReviewCount}\n`);
  stdout.write(`- deletedReports=${summary.deletedReportCount}\n`);
  stdout.write(`- deletedPageViews=${summary.deletedPageViewCount}\n`);
  stdout.write(`- deletedSearches=${summary.deletedSearchCount}\n`);
  stdout.write(`- deletedVisitors=${summary.deletedVisitorCount}\n`);
  stdout.write(`- deletedTransactions=${summary.deletedTransactionCount}\n`);
  stdout.write(`- deletedImages=${summary.deletedImageCount}\n`);
  stdout.write(`- deletedAuditLogs=${summary.deletedAuditLogCount}\n`);
  stdout.write(`- deletedAdmins=${summary.deletedAdminCount}\n`);

  return {
    ...summary,
    targetUserIds,
    unmatchedTargets,
    protectedTargets,
    dependencyReport,
    dryRun: false,
    aborted: false,
    databaseName: startupVerification?.databaseName,
    userCount: startupVerification?.userCount
  };
};

const run = async () => {
  const args = parseArgs();
  if (args.help) {
    printUsage();
    return;
  }

  const result = await cleanupTestSellers(args);

  if (result.aborted && result.reason === 'no-targets') {
    process.exit(1);
  }
  if (result.aborted) {
    process.exit(1);
  }
  process.exit(0);
};

if (require.main === module) {
  run().catch((error) => {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  cleanupTestSellers,
  parseArgs,
  PROTECTED_ROLES,
  PROTECTED_EMAILS
};
