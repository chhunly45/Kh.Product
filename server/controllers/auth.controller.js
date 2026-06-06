const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await authService.registerUser(payload);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.loginUser(identifier, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const { identifier, code } = req.body;
    const result = await authService.verifyLoginOtp(identifier, code);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const resendLoginOtp = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const result = await authService.resendLoginOtp(identifier);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(req.user.id, refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await authService.updateProfile(req.user.id, updates);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const requestVerification = async (req, res, next) => {
  try {
    const user = await authService.requestVerification(req.user.id, req.body.details);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  requestVerification
};
