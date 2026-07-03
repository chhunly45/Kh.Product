const { strict: assert } = require('node:assert');
const { describe, it, before, after, beforeEach } = require('node:test');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongod;
let User;
let requireAuth;
let requireVerifiedAccount;

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  const connectDatabase = require('../config/database');
  await connectDatabase();
  ({ User } = require('../models'));
  requireAuth = require('../middleware/authentication/requireAuth');
  requireVerifiedAccount = require('../middleware/authorization/requireVerifiedAccount');
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('authorization middleware', () => {
  it('rejects unauthenticated requests', async () => {
    let statusCode = 200;
    let body = {};
    const req = { headers: {}, cookies: {} };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        body = payload;
      }
    };

    await requireAuth(req, res, () => {});

    assert.equal(statusCode, 401);
    assert.equal(body.success, false);
  });

  it('rejects verified-account requirement for unverified users', async () => {
    const req = { user: { emailVerified: false } };
    let statusCode = 200;
    let body = {};
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        body = payload;
      }
    };

    requireVerifiedAccount(req, res, () => {});

    assert.equal(statusCode, 403);
    assert.equal(body.success, false);
  });

  it('allows verified users through the verified-account guard', async () => {
    let called = false;
    const req = { user: { emailVerified: true } };
    const res = {
      status(code) {
        return this;
      },
      json() {}
    };

    requireVerifiedAccount(req, res, () => {
      called = true;
    });

    assert.equal(called, true);
  });
});
