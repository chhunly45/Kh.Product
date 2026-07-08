const { strict: assert } = require('node:assert');
const { describe, it, before, after, beforeEach } = require('node:test');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');
const axios = require('axios');
const jwt = require('jsonwebtoken');

let config;
let previewSellerDeletion;
let deleteSellerAccount;

let server;
let base;
let mongod;
let User;
let Product;
let Chat;
let Message;
let Favorite;
let Promotion;
let SellerVerification;
let Review;
let Report;
let PageView;
let Search;
let Visitor;
let Transaction;
let Image;
let AuditLog;
let Admin;
let adminUser;
let sellerUser;

const createAuthHeaders = (user, client) => {
  const token = jwt.sign({ userId: user._id.toString() }, config.jwtSecret, { algorithm: 'HS256' });
  return client.get(`${base}/csrf-token`, { headers: { Origin: 'http://localhost:5173' } }).then((csrfResp) => {
    const setCookie = csrfResp.headers['set-cookie'] ? csrfResp.headers['set-cookie'].join('; ') : '';
    return {
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfResp.data.csrfToken,
      Cookie: setCookie
    };
  });
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.NODE_ENV = 'development';
  process.env.LOGIN_OTP_ENABLED = 'false';

  config = require('../config');
  ({ previewSellerDeletion, deleteSellerAccount } = require('../services/seller-deletion.service'));

  const connectDatabase = require('../config/database');
  await connectDatabase();
  ({ User, Product, Chat, Message, Favorite, Promotion, SellerVerification, Review, Report, PageView, Search, Visitor, Transaction, Image, AuditLog, Admin } = require('../models'));

  const app = require('../app');
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  base = `http://localhost:${port}/api`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
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

  adminUser = await User.create({
    email: 'admin@example.com',
    passwordHash: 'hash',
    displayName: 'Admin User',
    role: 'admin',
    emailVerified: true,
    isActive: true
  });

  sellerUser = await User.create({
    email: 'seller@example.com',
    passwordHash: 'hash',
    displayName: 'Seller One',
    role: 'seller',
    emailVerified: true,
    isActive: true
  });
});

describe('seller deletion admin API', () => {
  it('denies unauthenticated requests', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const csrfResp = await client.get(`${base}/csrf-token`, { headers: { Origin: 'http://localhost:5173' } });
    const response = await client.delete(`${base}/admin/sellers/${sellerUser._id}`, {
      data: { confirmation: 'DELETE' },
      headers: {
        'X-CSRF-Token': csrfResp.data.csrfToken,
        Cookie: csrfResp.headers['set-cookie'] ? csrfResp.headers['set-cookie'].join('; ') : ''
      }
    });

    assert.equal(response.status, 401);
  });

  it('denies non-admin users', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const regularUser = await User.create({
      email: 'regular@example.com',
      passwordHash: 'hash',
      displayName: 'Regular User',
      role: 'user',
      emailVerified: true,
      isActive: true
    });

    const headers = await createAuthHeaders(regularUser, client);
    const response = await client.delete(`${base}/admin/sellers/${sellerUser._id}`, {
      data: { confirmation: 'DELETE' },
      headers
    });

    assert.equal(response.status, 403);
  });

  it('requires a valid seller ID', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const headers = await createAuthHeaders(adminUser, client);
    const response = await client.get(`${base}/admin/sellers/not-a-valid-id/deletion-preview`, { headers });

    assert.equal(response.status, 400);
  });

  it('returns a dependency preview without deleting records', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    await Product.create({ seller: sellerUser._id, category: new mongoose.Types.ObjectId(), title: 'Product', slug: 'product-1', description: 'desc', price: 10 });
    const headers = await createAuthHeaders(adminUser, client);
    const response = await client.get(`${base}/admin/sellers/${sellerUser._id}/deletion-preview`, { headers });

    assert.equal(response.status, 200);
    assert.equal(response.data.data.products, 1);
    assert.equal(response.data.data.userId.toString(), sellerUser._id.toString());
    assert.equal(await Product.countDocuments({ seller: sellerUser._id }), 1);
    assert.equal(await User.countDocuments({ _id: sellerUser._id }), 1);
  });

  it('protects admin accounts from deletion', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const headers = await createAuthHeaders(adminUser, client);
    const response = await client.delete(`${base}/admin/sellers/${adminUser._id}`, {
      data: { confirmation: 'DELETE' },
      headers
    });

    assert.equal(response.status, 403);
    assert.equal(await User.countDocuments({ _id: adminUser._id }), 1);
  });

  it('protects superadmin accounts when supported', async () => {
    const superAdminDoc = await User.collection.insertOne({
      email: 'superadmin@example.com',
      passwordHash: 'hash',
      displayName: 'Super Admin',
      role: 'superadmin',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const superAdmin = await User.findById(superAdminDoc.insertedId).lean();
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const headers = await createAuthHeaders(adminUser, client);
    const response = await client.delete(`${base}/admin/sellers/${superAdmin._id}`, {
      data: { confirmation: 'DELETE' },
      headers
    });

    assert.equal(response.status, 403);
    assert.equal(await User.countDocuments({ _id: superAdmin._id }), 1);
  });

  it('protects the currently authenticated admin account', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const headers = await createAuthHeaders(adminUser, client);
    const response = await client.delete(`${base}/admin/sellers/${adminUser._id}`, {
      data: { confirmation: 'DELETE' },
      headers
    });

    assert.equal(response.status, 403);
  });

  it('protects non-seller accounts', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const headers = await createAuthHeaders(adminUser, client);
    const response = await client.delete(`${base}/admin/sellers/${adminUser._id}`, {
      data: { confirmation: 'DELETE' },
      headers
    });

    assert.equal(response.status, 403);
  });

  it('rejects invalid confirmation text', async () => {
    const client = axios.create({ validateStatus: null, withCredentials: true });
    const headers = await createAuthHeaders(adminUser, client);
    const response = await client.delete(`${base}/admin/sellers/${sellerUser._id}`, {
      data: { confirmation: 'WRONG' },
      headers
    });

    assert.equal(response.status, 400);
    assert.equal(await User.countDocuments({ _id: sellerUser._id }), 1);
  });

  it('deletes the user last and returns dependency cleanup counts', async () => {
    await Product.create({ seller: sellerUser._id, category: new mongoose.Types.ObjectId(), title: 'Product', slug: 'product-2', description: 'desc', price: 10 });
    const result = await deleteSellerAccount({
      userId: sellerUser._id.toString(),
      confirmation: 'DELETE',
      actorId: adminUser._id.toString(),
      skipConnect: true,
      confirmationText: 'DELETE'
    });

    assert.equal(result.deletedUserCount, 1);
    assert.equal(result.deletedProductCount, 1);
    assert.equal(result.deleteOrder[result.deleteOrder.length - 1], 'User');
    assert.equal(await User.countDocuments({ _id: sellerUser._id }), 0);
  });
});
