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

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendEmailVerificationCodeEmail = async (user, code) => {
  const message = `Welcome to Marketplace Kh! Your email verification code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`;
  await emailService.sendEmail({
    to: user.email,
    subject: 'Marketplace Kh email verification code',
    text: message,
    html: `<p>${message}</p>`
  });
};

const sendLoginOtpEmail = async (user, code) => {
  const message = `Your Marketplace Kh login verification code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`;
  await emailService.sendEmail({
    to: user.email,
    subject: 'Marketplace Kh login verification code',
    text: message,
    html: `<p>${message}</p>`
  });
};

const registerUser = async ({ email, password, displayName, phoneNumber, location }) => {
  const normalizedEmail = normalizeIdentifier(email);
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    displayName,
    phoneNumber,
    location,
    role: 'seller',
    emailVerified: false
  });

  const now = new Date();
  const otp = generateOtp();
  user.emailVerificationHash = await bcrypt.hash(otp, 12);
  user.emailVerificationExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  user.emailVerificationRequestedAt = now;
  user.emailVerificationAttempts = 0;
  await user.save();

  await sendEmailVerificationCodeEmail(user, otp);

  return {
    requiresEmailVerification: true,
    identifier: user.email,
    expiresIn: 300,
    resendCooldownSeconds: 60
  };
};

const sendPasswordResetOtpEmail = async (user, code) => {
  const message = `Your Marketplace Kh password reset code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`;
  await emailService.sendEmail({
    to: user.email,
    subject: 'Marketplace Kh password reset code',
    text: message,
    html: `<p>${message}</p>`
  });
};

const loginUser = async (identifier, password) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.emailVerified) {
    const error = new Error('Email not verified. Please verify your email before logging in.');
    error.statusCode = 403;
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

  const otp = generateOtp();
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
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, verified: user.verified, emailVerified: user.emailVerified },
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

  const otp = generateOtp();
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

const verifyEmail = async (identifier, code) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid verification request');
    error.statusCode = 401;
    throw error;
  }

  if (user.emailVerified) {
    return { verified: true };
  }

  if (!user.emailVerificationHash || !user.emailVerificationExpiresAt || new Date() > user.emailVerificationExpiresAt) {
    user.emailVerificationHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    user.emailVerificationRequestedAt = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    const error = new Error('Verification code expired. Please request a new code.');
    error.statusCode = 401;
    throw error;
  }

  if (user.emailVerificationAttempts >= 5) {
    const error = new Error('Too many invalid attempts. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  const validOtp = await bcrypt.compare(code, user.emailVerificationHash);
  if (!validOtp) {
    user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
    await user.save();
    const error = new Error('Invalid verification code');
    error.statusCode = 401;
    throw error;
  }

  user.emailVerified = true;
  user.emailVerificationHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.emailVerificationRequestedAt = undefined;
  user.emailVerificationAttempts = 0;
  await user.save();

  return { verified: true };
};

const resendEmailVerification = async (identifier) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid verification request');
    error.statusCode = 401;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error('Email is already verified.');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  if (user.emailVerificationRequestedAt && now.getTime() - user.emailVerificationRequestedAt.getTime() < 60 * 1000) {
    const wait = 60 - Math.floor((now.getTime() - user.emailVerificationRequestedAt.getTime()) / 1000);
    const error = new Error(`Please wait ${wait} seconds before resending the code.`);
    error.statusCode = 429;
    throw error;
  }

  const otp = generateOtp();
  user.emailVerificationHash = await bcrypt.hash(otp, 12);
  user.emailVerificationExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  user.emailVerificationRequestedAt = now;
  user.emailVerificationAttempts = 0;
  await user.save();

  await sendEmailVerificationCodeEmail(user, otp);

  return {
    expiresIn: 300,
    resendCooldownSeconds: 60
  };
};

const requestPasswordReset = async (identifier) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid password reset request');
    error.statusCode = 401;
    throw error;
  }

  const now = new Date();
  if (user.passwordResetRequestedAt && now.getTime() - user.passwordResetRequestedAt.getTime() < 60 * 1000) {
    const wait = 60 - Math.floor((now.getTime() - user.passwordResetRequestedAt.getTime()) / 1000);
    const error = new Error(`Please wait ${wait} seconds before requesting another password reset.`);
    error.statusCode = 429;
    throw error;
  }

  const otp = generateOtp();
  user.passwordResetOtpHash = await bcrypt.hash(otp, 12);
  user.passwordResetOtpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  user.passwordResetRequestedAt = now;
  user.passwordResetAttempts = 0;
  await user.save();

  await sendPasswordResetOtpEmail(user, otp);

  return {
    expiresIn: 300,
    resendCooldownSeconds: 60
  };
};

const verifyPasswordResetOtp = async (identifier, code) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid password reset request');
    error.statusCode = 401;
    throw error;
  }

  if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt || new Date() > user.passwordResetOtpExpiresAt) {
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetRequestedAt = undefined;
    user.passwordResetAttempts = 0;
    await user.save();

    const error = new Error('Reset code expired. Please request a new code.');
    error.statusCode = 401;
    throw error;
  }

  if (user.passwordResetAttempts >= 5) {
    const error = new Error('Too many invalid attempts. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  const validOtp = await bcrypt.compare(code, user.passwordResetOtpHash);
  if (!validOtp) {
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
    await user.save();
    const error = new Error('Invalid reset code');
    error.statusCode = 401;
    throw error;
  }

  return { valid: true };
};

const resetPassword = async (identifier, code, newPassword) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid password reset request');
    error.statusCode = 401;
    throw error;
  }

  if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt || new Date() > user.passwordResetOtpExpiresAt) {
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetRequestedAt = undefined;
    user.passwordResetAttempts = 0;
    await user.save();

    const error = new Error('Reset code expired. Please request a new code.');
    error.statusCode = 401;
    throw error;
  }

  if (user.passwordResetAttempts >= 5) {
    const error = new Error('Too many invalid attempts. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  const validOtp = await bcrypt.compare(code, user.passwordResetOtpHash);
  if (!validOtp) {
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
    await user.save();
    const error = new Error('Invalid reset code');
    error.statusCode = 401;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpiresAt = undefined;
  user.passwordResetRequestedAt = undefined;
  user.passwordResetAttempts = 0;
  user.refreshTokens = [];
  await user.save();

  return { success: true };
};

const resendPasswordResetOtp = async (identifier) => {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) {
    const error = new Error('Invalid password reset request');
    error.statusCode = 401;
    throw error;
  }

  const now = new Date();
  if (user.passwordResetRequestedAt && now.getTime() - user.passwordResetRequestedAt.getTime() < 60 * 1000) {
    const wait = 60 - Math.floor((now.getTime() - user.passwordResetRequestedAt.getTime()) / 1000);
    const error = new Error(`Please wait ${wait} seconds before resending the code.`);
    error.statusCode = 429;
    throw error;
  }

  const otp = generateOtp();
  user.passwordResetOtpHash = await bcrypt.hash(otp, 12);
  user.passwordResetOtpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  user.passwordResetRequestedAt = now;
  user.passwordResetAttempts = 0;
  await user.save();

  await sendPasswordResetOtpEmail(user, otp);

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
  // If client submitted a data URL for profileImageUrl, upload to Cloudinary
  if (sanitized.profileImageUrl && typeof sanitized.profileImageUrl === 'string' && sanitized.profileImageUrl.startsWith('data:')) {
    try {
      const cloudinary = require('../config/cloudinary');
      const uploadResult = await cloudinary.uploader.upload(sanitized.profileImageUrl, { folder: `${require('../config').cloudinary.folder}/profiles` });
      if (uploadResult && uploadResult.secure_url) {
        sanitized.profileImageUrl = uploadResult.secure_url;
      }
    } catch (err) {
      // if upload fails, remove the profileImageUrl from update to avoid storing large base64
      delete sanitized.profileImageUrl;
    }
  }

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

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  return { success: true };
};

module.exports = {
  registerUser,
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  resendPasswordResetOtp,
  refreshToken,
  logoutUser,
  updateProfile,
  requestVerification
  ,
  changePassword
};
