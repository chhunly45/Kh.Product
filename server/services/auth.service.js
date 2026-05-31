const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

const createToken = (userId) => jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' });
const createRefreshToken = (userId) => jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.refreshTokenExpiresIn, algorithm: 'HS256' });

const registerUser = async ({ email, password, displayName, phoneNumber, location }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, displayName, phoneNumber, location, role: 'seller' });

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

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
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

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  updateProfile
};
