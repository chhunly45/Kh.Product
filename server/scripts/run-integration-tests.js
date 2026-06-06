const { MongoMemoryServer } = require('mongodb-memory-server');
let connectDatabase;
const mongoose = require('mongoose');
const http = require('http');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('[integration] starting in-memory mongo');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'development';

  // require database connect after setting env so config picks up the test URI
  connectDatabase = require('../config/database');

  try {
    await connectDatabase();
  } catch (err) {
    console.error('[integration] DB connect failed', err);
    process.exit(1);
  }

  // require app after environment is set to ensure config picks up MONGODB_URI
  // require models and app after DB connect/env configured
  const { User } = require('../models');
  const app = require('../app');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const base = `http://localhost:${port}/api`;
  console.log('[integration] server running on', base);

  try {
    // create test user
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: 'test@example.com',
      passwordHash,
      displayName: 'Test User',
      role: 'user',
      emailVerified: true
    });
    const fresh = await User.findOne({ email: 'test@example.com' }).lean();
    console.log('[integration] created user emailVerified=', fresh.emailVerified);

    // get CSRF token and cookie
    const csrfResp = await axios.get(`${base}/csrf-token`);
    const csrfToken = csrfResp.data && csrfResp.data.csrfToken;
    const setCookie = (csrfResp.headers && csrfResp.headers['set-cookie']) ? csrfResp.headers['set-cookie'].join('; ') : '';
    if (!csrfToken) throw new Error('Unable to get CSRF token');
    console.log('[integration] got csrf token and cookie');

    const defaultHeaders = { 'X-CSRF-Token': csrfToken, Cookie: setCookie };

    // 1) Login (should trigger OTP)
    console.log('[integration] testing login (requesting OTP)');
    const loginResp = await axios.post(`${base}/auth/login`, { identifier: 'test@example.com', password }, { headers: defaultHeaders });
    if (!loginResp.data || !loginResp.data.data || !loginResp.data.data.requiresOtp) {
      throw new Error('Login did not request OTP as expected');
    }
    console.log('[integration] login requested OTP');

    // wait for dev-emails folder and read OTP (saved by email.service in server/dev-emails)
    const devDir = path.resolve(process.cwd(), 'dev-emails');
    let otp = null;
    for (let i = 0; i < 20; i++) {
      if (fs.existsSync(devDir)) {
        const files = fs.readdirSync(devDir).filter((f) => f.startsWith('email-')).sort();
        if (files.length > 0) {
          const latest = files[files.length - 1];
          const content = fs.readFileSync(path.join(devDir, latest), 'utf8');
          const m = content.match(/code is (\d{6})|code: (\d{6})|(verification code is (\d{6}))/i);
          if (m) otp = (m[1] || m[2] || m[4]).toString();
          break;
        }
      }
      await wait(250);
    }
    if (!otp) throw new Error('OTP email not found in dev-emails');
    console.log('[integration] found OTP:', otp);

    // verify login OTP
    let verifyResp;
    try {
      verifyResp = await axios.post(`${base}/auth/login/verify`, { identifier: 'test@example.com', code: otp }, { headers: defaultHeaders });
    } catch (e) {
      console.error('[integration] login verify failed status:', e.response?.status);
      console.error('[integration] login verify body:', e.response?.data);
      throw e;
    }
    const authData = verifyResp.data.data;
    if (!authData || !authData.accessToken) throw new Error('Login verify did not return tokens');
    const token = authData.accessToken;
    console.log('[integration] login verify succeeded, token obtained');

    // 2) Change password
    console.log('[integration] testing change-password');
    let changeResp;
    try {
      changeResp = await axios.post(`${base}/auth/change-password`, { currentPassword: password, newPassword: 'NewPass!234' }, { headers: { Authorization: `Bearer ${token}`, ...defaultHeaders } });
    } catch (e) {
      console.error('[integration] change-password status:', e.response?.status);
      console.error('[integration] change-password body:', e.response?.data);
      throw e;
    }
    if (!changeResp.data || !changeResp.data.data || !changeResp.data.data.success) {
      throw new Error('Change password failed');
    }
    console.log('[integration] change-password succeeded');

    // 3) Account/profile update
    console.log('[integration] testing profile update');
    let updateResp;
    try {
      updateResp = await axios.put(`${base}/auth/me`, { displayName: 'Updated Name' }, { headers: { Authorization: `Bearer ${token}`, ...defaultHeaders } });
    } catch (e) {
      console.error('[integration] profile update status:', e.response?.status);
      console.error('[integration] profile update body:', e.response?.data);
      throw e;
    }
    if (!updateResp.data || !updateResp.data.data || updateResp.data.data.displayName !== 'Updated Name') {
      throw new Error('Profile update failed');
    }
    console.log('[integration] profile update succeeded');

    // 4) Verification/profile routes (request verification)
    console.log('[integration] testing verification request');
    let verifyReqResp;
    try {
      verifyReqResp = await axios.post(`${base}/auth/verification-request`, { details: 'Please verify me' }, { headers: { Authorization: `Bearer ${token}`, ...defaultHeaders } });
    } catch (e) {
      console.error('[integration] verification request status:', e.response?.status);
      console.error('[integration] verification request body:', e.response?.data);
      throw e;
    }
    if (!verifyReqResp.data || !verifyReqResp.data.data || verifyReqResp.data.data.verificationStatus !== 'pending') {
      throw new Error('Verification request failed');
    }
    console.log('[integration] verification request succeeded');

    console.log('[integration] all tests passed');

    // Clean up
    await mongoose.disconnect();
    await mongod.stop();
    server.close();

    process.exit(0);
  } catch (err) {
    console.error('[integration] tests failed:', err.message || err);
    try {
      await mongoose.disconnect();
      await mongod.stop();
    } catch (e) {}
    server.close();
    process.exit(2);
  }
})();
