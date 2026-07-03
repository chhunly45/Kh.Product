const express = require('express');
const { body, param } = require('express-validator');
const reportController = require('../controllers/report.controller');
const requireAuth = require('../middleware/authentication/requireAuth');
const requireVerifiedAccount = require('../middleware/authorization/requireVerifiedAccount');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

const reasonOptions = ['scam', 'fake_product', 'duplicate_listing', 'wrong_category', 'other'];

router.post(
  '/',
  requireAuth,
  requireVerifiedAccount,
  body('targetType').isIn(['product', 'user']).withMessage('Invalid target type'),
  body('targetId').isMongoId().withMessage('Valid targetId is required'),
  body('reason').isIn(reasonOptions).withMessage('Valid reason is required'),
  body('details').optional().trim().isString(),
  validate,
  reportController.createReport
);

router.get('/me', requireAuth, reportController.getMyReports);

module.exports = router;
