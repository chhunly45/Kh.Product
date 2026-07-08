const { strict: assert } = require('node:assert');
const { PassThrough } = require('node:stream');
const { describe, it, before, after, beforeEach } = require('node:test');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const { cleanupTestSellers, parseArgs } = require('../scripts/cleanup-test-sellers');

const createInteractiveStdin = (value = 'DELETE TEST SELLERS') => ({
  isTTY: true,
  value,
  resume() {},
  setEncoding() {},
  once(event, callback) {
    if (event === 'data') {
      setImmediate(() => callback(value));
    }
  }
});

const createInteractiveStreams = (value = 'DELETE TEST SELLERS') => {
  const stdin = new PassThrough();
  stdin.isTTY = true;
  const stdout = new PassThrough();
  stdout.isTTY = true;
  const stderr = new PassThrough();
  stderr.isTTY = true;
  setImmediate(() => {
    try {
      stdin.write(`${value}\n`);
    } catch (error) {
      // ignore test stream write races
    }
    try {
      stdin.end();
    } catch (error) {
      // ignore test stream end races
    }
  });
  return { stdin, stdout, stderr };
};
const { User, Product, Chat, Message, Favorite, Promotion, SellerVerification, Review, Report, PageView, Search, Visitor, Transaction, Image, AuditLog, Admin } = require('../models');

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
});

beforeEach(async () => {
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = mongod.getUri();
  }
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Chat.deleteMany({}),
    Message.deleteMany({}),
    Favorite.deleteMany({}),
    Promotion.deleteMany({}),
    SellerVerification.deleteMany({}),
    Review.deleteMany({}),
    Report.deleteMany({}),
    PageView.deleteMany({}),
    Search.deleteMany({}),
    Visitor.deleteMany({}),
    Transaction.deleteMany({}),
    Image.deleteMany({}),
    AuditLog.deleteMany({}),
    Admin.deleteMany({})
  ]);
});

describe('cleanup-test-sellers', () => {
  it('dry run performs zero deletes', async () => {
    const target = await User.create({
      email: 'test-seller@example.com',
      passwordHash: 'hash',
      displayName: 'Test Seller',
      role: 'seller',
      isActive: true
    });
    await Product.create({ seller: target._id, category: new mongoose.Types.ObjectId(), title: 'Product', slug: 'product-1', description: 'desc', price: 10 });

    const result = await cleanupTestSellers({ emailTargets: ['test-seller@example.com'], confirmDelete: false, skipConnect: true });

    assert.equal(result.deletedUserCount, 0);
    assert.equal(result.deletedProductCount, 0);
    assert.equal(await User.countDocuments({ _id: target._id }), 1);
    assert.equal(await Product.countDocuments({ seller: target._id }), 1);
  });

  it('aborts before shared DB config evaluation when the Mongo env is missing', async () => {
    const previousMongoEnv = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    delete process.env.MONGO_URI;

    try {
      const result = await cleanupTestSellers({ emailTargets: ['missing-env@example.com'], confirmDelete: false, skipConnect: true });
      assert.equal(result.aborted, true);
      assert.equal(result.reason, 'mongo-env-missing');
    } finally {
      if (previousMongoEnv) {
        process.env.MONGODB_URI = previousMongoEnv;
      }
    }
  });

  it('reports the active database and user count during startup verification', async () => {
    const target = await User.create({
      email: 'verify-db@example.com',
      passwordHash: 'hash',
      displayName: 'Verify DB',
      role: 'seller'
    });

    const result = await cleanupTestSellers({ emailTargets: ['verify-db@example.com'], confirmDelete: false });

    assert.equal(result.databaseName, mongoose.connection.name);
    assert.equal(typeof result.userCount, 'number');
    assert.equal(result.userCount >= 1, true);
    assert.equal(await User.countDocuments({ _id: target._id }), 1);
  });

  it('targets explicit email addresses', async () => {
    const target = await User.create({
      email: 'email-target@example.com',
      passwordHash: 'hash',
      displayName: 'Email Target',
      role: 'seller'
    });

    const streams = createInteractiveStreams();
    const result = await cleanupTestSellers({
      emailTargets: ['email-target@example.com'],
      confirmDelete: true,
      confirmationText: 'DELETE TEST SELLERS',
      skipConnect: true,
      stdin: streams.stdin,
      stdout: streams.stdout,
      stderr: streams.stderr
    });

    assert.equal(result.targetUserIds.length, 1);
    assert.equal(result.targetUserIds[0].toString(), target._id.toString());
    assert.equal(result.deletedUserCount, 1);
  });

  it('targets explicit user IDs', async () => {
    const target = await User.create({
      email: 'id-target@example.com',
      passwordHash: 'hash',
      displayName: 'ID Target',
      role: 'seller'
    });

    const streams = createInteractiveStreams();
    const result = await cleanupTestSellers({
      idTargets: [target._id.toString()],
      confirmDelete: true,
      confirmationText: 'DELETE TEST SELLERS',
      skipConnect: true,
      stdin: streams.stdin,
      stdout: streams.stdout,
      stderr: streams.stderr
    });

    assert.equal(result.targetUserIds.length, 1);
    assert.equal(result.targetUserIds[0].toString(), target._id.toString());
    assert.equal(result.deletedUserCount, 1);
  });

  it('reports unmatched targets', async () => {
    const result = await cleanupTestSellers({ emailTargets: ['missing@example.com'], confirmDelete: false, skipConnect: true });

    assert.equal(result.unmatchedTargets.length, 1);
    assert.equal(result.unmatchedTargets[0].value, 'missing@example.com');
  });

  it('protects admin accounts', async () => {
    const target = await User.create({
      email: 'admin@example.com',
      passwordHash: 'hash',
      displayName: 'Protected Admin',
      role: 'admin'
    });

    const streams = createInteractiveStreams();
    const result = await cleanupTestSellers({
      emailTargets: ['admin@example.com'],
      confirmDelete: true,
      confirmationText: 'DELETE TEST SELLERS',
      skipConnect: true,
      stdin: streams.stdin,
      stdout: streams.stdout,
      stderr: streams.stderr
    });

    assert.equal(result.deletedUserCount, 0);
    assert.equal(await User.countDocuments({ _id: target._id }), 1);
    assert.equal(result.protectedTargets.length, 1);
  });

  it('waits for interactive confirmation input and accepts the exact confirmation text', async () => {
    const target = await User.create({
      email: 'interactive-confirm@example.com',
      passwordHash: 'hash',
      displayName: 'Interactive Confirm',
      role: 'seller'
    });

    const streams = createInteractiveStreams('DELETE TEST SELLERS');
    const result = await cleanupTestSellers({
      emailTargets: ['interactive-confirm@example.com'],
      confirmDelete: true,
      confirmationText: 'DELETE TEST SELLERS',
      skipConnect: true,
      stdin: streams.stdin,
      stdout: streams.stdout,
      stderr: streams.stderr
    });

    assert.equal(result.deletedUserCount, 1);
    assert.equal(result.aborted, false);
    assert.equal(await User.countDocuments({ _id: target._id }), 0);
  });

  it('aborts destructive mode without exact confirmation', async () => {
    await User.create({
      email: 'confirm-example@example.com',
      passwordHash: 'hash',
      displayName: 'Confirm Example',
      role: 'seller'
    });

    const streams = createInteractiveStreams('WRONG');
    const result = await cleanupTestSellers({
      emailTargets: ['confirm-example@example.com'],
      confirmDelete: true,
      confirmationText: 'DELETE TEST SELLERS',
      skipConnect: true,
      stdin: streams.stdin,
      stdout: streams.stdout,
      stderr: streams.stderr
    });

    assert.equal(result.deletedUserCount, 0);
    assert.equal(result.aborted, true);
    assert.equal(result.reason, 'confirmation-mismatch');
  });

  it('deletes the user last in the operation order', async () => {
    const target = await User.create({
      email: 'order-example@example.com',
      passwordHash: 'hash',
      displayName: 'Order Example',
      role: 'seller'
    });
    await Product.create({ seller: target._id, category: new mongoose.Types.ObjectId(), title: 'Product', slug: 'product-order', description: 'desc', price: 10 });

    const streams = createInteractiveStreams();
    const result = await cleanupTestSellers({
      emailTargets: ['order-example@example.com'],
      confirmDelete: true,
      confirmationText: 'DELETE TEST SELLERS',
      skipConnect: true,
      stdin: streams.stdin,
      stdout: streams.stdout,
      stderr: streams.stderr
    });

    assert.equal(result.deleteOrder[result.deleteOrder.length - 1], 'User');
    assert.equal(result.deletedUserCount, 1);
  });

  it('removes actual dependency references before deleting the user', async () => {
    const target = await User.create({
      email: 'dep-example@example.com',
      passwordHash: 'hash',
      displayName: 'Dep Example',
      role: 'seller'
    });
    await Product.create({ seller: target._id, category: new mongoose.Types.ObjectId(), title: 'Product', slug: 'product-dep', description: 'desc', price: 10 });
    await Chat.create({ product: new mongoose.Types.ObjectId(), buyer: new mongoose.Types.ObjectId(), seller: target._id });
    await Message.create({ chat: new mongoose.Types.ObjectId(), sender: target._id, content: 'hi' });
    await Favorite.create({ user: target._id, product: new mongoose.Types.ObjectId() });
    await Promotion.create({ seller: target._id, product: new mongoose.Types.ObjectId(), plan: '3_days', durationDays: 3, price: 1, currency: 'KHR', status: 'pending' });
    await SellerVerification.create({ userId: target._id, idCardImage: 'id', selfieImage: 'selfie' });
    await Review.create({ seller: target._id, reviewer: new mongoose.Types.ObjectId(), product: new mongoose.Types.ObjectId(), rating: 5, comment: 'ok' });
    await Report.create({ reporter: target._id, targetType: 'user', targetId: target._id, reason: 'spam', details: 'x' });
    await PageView.create({ sessionId: 's1', userId: target._id, pageType: 'seller_profile', sellerId: target._id });
    await Search.create({ sessionId: 's2', userId: target._id, query: 'watch' });
    await Visitor.create({ sessionId: 'v1', userId: target._id, ipAddress: '1.1.1.1' });
    await Transaction.create({ seller: target._id, buyer: new mongoose.Types.ObjectId(), product: new mongoose.Types.ObjectId(), amount: 1, currency: 'KHR', transactionType: 'sale', status: 'completed' });
    await Image.create({ product: new mongoose.Types.ObjectId(), uploadedBy: target._id, url: 'img', publicId: 'p1' });
    await AuditLog.create({ admin: target._id, action: 'test', targetType: 'user', targetId: target._id });
    await Admin.create({ user: target._id, role: 'admin' });

    const streams = createInteractiveStreams();
    const result = await cleanupTestSellers({
      emailTargets: ['dep-example@example.com'],
      confirmDelete: true,
      confirmationText: 'DELETE TEST SELLERS',
      skipConnect: true,
      stdin: streams.stdin,
      stdout: streams.stdout,
      stderr: streams.stderr
    });

    assert.equal(result.deletedProductCount, 1);
    assert.equal(result.deletedChatCount, 1);
    assert.equal(result.deletedMessageCount, 1);
    assert.equal(result.deletedFavoriteCount, 1);
    assert.equal(result.deletedPromotionCount, 1);
    assert.equal(result.deletedSellerVerificationCount, 1);
    assert.equal(result.deletedReviewCount, 1);
    assert.equal(result.deletedReportCount, 1);
    assert.equal(result.deletedPageViewCount, 1);
    assert.equal(result.deletedSearchCount, 1);
    assert.equal(result.deletedVisitorCount, 1);
    assert.equal(result.deletedTransactionCount, 1);
    assert.equal(result.deletedImageCount, 1);
    assert.equal(result.deletedAuditLogCount, 1);
    assert.equal(result.deletedAdminCount, 1);
    assert.equal(await User.countDocuments({ _id: target._id }), 0);
  });

  it('parses CLI arguments', () => {
    const result = parseArgs(['--email', 'a@example.com', '--id', '507f1f77bcf86cd799439011', '--confirm-delete']);

    assert.deepEqual(result.emailTargets, ['a@example.com']);
    assert.deepEqual(result.idTargets, ['507f1f77bcf86cd799439011']);
    assert.equal(result.confirmDelete, true);
  });
});
