const express = require('express');
const { body } = require('express-validator');
const verificationController = require('../controllers/verification.controller');
const requireAuth = require('../middleware/authentication/requireAuth');
const requireVerifiedAccount = require('../middleware/authorization/requireVerifiedAccount');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.post(
  '/request',
  requireAuth,
  requireVerifiedAccount,
  body('idCardImage').notEmpty().withMessage('ID card image is required'),
  body('selfieImage').notEmpty().withMessage('Selfie image is required'),
  body('businessDocument').optional().isString(),
  body('details').optional().trim().isString(),
  validate,
  verificationController.requestVerification
);

router.get('/status', requireAuth, verificationController.getVerificationStatus);

module.exports = router;
