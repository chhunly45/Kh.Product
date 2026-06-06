const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const notificationService = require('./notification.service');
const emailService = require('./email.service');

const createToken = (userId) => jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' });
const createRefreshToken = (userId) => jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.refreshTokenExpiresIn, algorithm: 'HS256' });

const normalizeIdentifier = (identifier) => identifier?.toString().trim().toLowerCase();
const findUserByIdentifier = async (identifier) => {
  if (!identifier) return null;
  const normalized = normalizeIdentifier(identifier);
  if (normalized.includes('@')) {
    return User.findOne({ email: normalized });
  }
  const phone = normalized.replace(/\D/g, '');
  return User.findOne({ phoneNumber: phone });
};

const registerUser = async ({ email, password, displayName, phoneNumber, location }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: normalizeIdentifier(email), passwordHash, displayName, phoneNumber, location, role: 'seller' });

  const accessToken = createToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  return {
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, verified: user.verified },
    accessToken,
    refreshToken
  };
};

const sendLoginOtpEmail = async (user, code) => {
  const message = `Your Marketplace Kh verification code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`;
  await emailService.sendEmail({
    to: user.email,
    subject: 'Marketplace Kh login verification code',
    text: message,
    html: `<p>${message}</p>`
  });
};

const generateLoginOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const loginUser = async (identifier, password) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const now = new Date();
  if (user.loginOtpRequestedAt && now.getTime() - user.loginOtpRequestedAt.getTime() < 60 * 1000) {
    const wait = 60 - Math.floor((now.getTime() - user.loginOtpRequestedAt.getTime()) / 1000);
    const error = new Error(`Please wait ${wait} seconds before requesting another verification code.`);
    error.statusCode = 429;
    throw error;
  }

  const otp = generateLoginOtp();
  user.loginOtpHash = await bcrypt.hash(otp, 12);
  user.loginOtpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  user.loginOtpRequestedAt = now;
  user.loginOtpAttempts = 0;
  await user.save();

  await sendLoginOtpEmail(user, otp);

  return {
    requiresOtp: true,
    expiresIn: 300,
    resendCooldownSeconds: 60
  };
};

const verifyLoginOtp = async (identifier, code) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid verification request');
    error.statusCode = 401;
    throw error;
  }

  if (!user.loginOtpHash || !user.loginOtpExpiresAt || new Date() > user.loginOtpExpiresAt) {
    user.loginOtpHash = undefined;
    user.loginOtpExpiresAt = undefined;
    user.loginOtpRequestedAt = undefined;
    user.loginOtpAttempts = 0;
    await user.save();

    const error = new Error('Verification code expired. Please request a new code.');
    error.statusCode = 401;
    throw error;
  }

  if (user.loginOtpAttempts >= 5) {
    const error = new Error('Too many invalid attempts. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  const validOtp = await bcrypt.compare(code, user.loginOtpHash);
  if (!validOtp) {
    user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
    await user.save();
    const error = new Error('Invalid verification code');
    error.statusCode = 401;
    throw error;
  }

  user.loginOtpHash = undefined;
  user.loginOtpExpiresAt = undefined;
  user.loginOtpRequestedAt = undefined;
  user.loginOtpAttempts = 0;

  const accessToken = createToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  user.refreshTokens.push(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, verified: user.verified },
    accessToken,
    refreshToken
  };
};

const resendLoginOtp = async (identifier) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid verification request');
    error.statusCode = 401;
    throw error;
  }

  const now = new Date();
  if (user.loginOtpRequestedAt && now.getTime() - user.loginOtpRequestedAt.getTime() < 60 * 1000) {
    const wait = 60 - Math.floor((now.getTime() - user.loginOtpRequestedAt.getTime()) / 1000);
    const error = new Error(`Please wait ${wait} seconds before resending the code.`);
    error.statusCode = 429;
    throw error;
  }

  if (!user.loginOtpHash || !user.loginOtpExpiresAt) {
    const error = new Error('No pending verification request found. Please login again.');
    error.statusCode = 400;
    throw error;
  }

  const otp = generateLoginOtp();
  user.loginOtpHash = await bcrypt.hash(otp, 12);
  user.loginOtpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  user.loginOtpRequestedAt = now;
  user.loginOtpAttempts = 0;
  await user.save();

  await sendLoginOtpEmail(user, otp);

  return {
    expiresIn: 300,
    resendCooldownSeconds: 60
  };
};

const refreshToken = async (token) => {
  if (!token) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.refreshTokens.includes(token)) {
    const error = new Error('Refresh token is not valid');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = createToken(user.id);
  const newRefreshToken = createRefreshToken(user.id);
  user.refreshTokens = user.refreshTokens.filter((item) => item !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

const logoutUser = async (userId, token) => {
  const user = await User.findById(userId);
  if (!user) return;
  if (token) {
    user.refreshTokens = user.refreshTokens.filter((refreshToken) => refreshToken !== token);
  } else {
    user.refreshTokens = [];
  }
  await user.save();
};

const updateProfile = async (userId, updates) => {
  const allowed = ['displayName', 'bio', 'location', 'profileImageUrl', 'phoneNumber'];
  const sanitized = allowed.reduce((acc, key) => {
    if (updates[key] !== undefined) acc[key] = updates[key];
    return acc;
  }, {});
  const user = await User.findByIdAndUpdate(userId, sanitized, { new: true, runValidators: true }).select('-passwordHash -refreshTokens');
  return user;
};

const requestVerification = async (userId, details) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.verified) {
    const error = new Error('Seller is already verified');
    error.statusCode = 400;
    throw error;
  }

  user.verificationStatus = 'pending';
  user.verificationRequestedAt = new Date();
  user.verificationMessage = details || '';
  await user.save();

  await notificationService.addNotification(user._id, {
    type: 'verification',
    title: 'Verification request submitted',
    message: 'Your seller verification request has been sent for review.',
    link: '/profile'
  });

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
  refreshToken,
  logoutUser,
  updateProfile,
  requestVerification
};
