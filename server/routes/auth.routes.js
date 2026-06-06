const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.post(
  '/register',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must have at least 6 characters'),
  body('displayName').notEmpty().withMessage('Display name is required'),
  validate,
  authController.register
);

router.post(
  '/login',
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  authController.login
);

router.post(
  '/login/verify',
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  validate,
  authController.verifyLoginOtp
);

router.post(
  '/login/resend',
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  validate,
  authController.resendLoginOtp
);

router.post('/refresh', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/me', authMiddleware, authController.updateProfile);
router.post('/verification-request', authMiddleware, body('details').optional().trim().isString(), validate, authController.requestVerification);

module.exports = router;
