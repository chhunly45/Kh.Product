const express = require('express');
const { body, param, query } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();
router.use(authMiddleware, roleMiddleware(['admin', 'moderator']));

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/status',
  param('id').isMongoId(),
  body('isActive').optional().isBoolean(),
  body('role').optional().isIn(['user','seller','admin','moderator']),
  body('sellerVerificationStatus').optional().isIn(['unverified','verified','rejected']),
  body('verified').optional().isBoolean(),
  body('verificationStatus').optional().isIn(['none','pending','approved','rejected']),
  validate,
  adminController.updateUserStatus
);
router.get('/products', adminController.listProducts);
router.patch('/products/:id/status', param('id').isMongoId(), body('status').isIn(['published','sold','archived','flagged']).withMessage('Invalid status'), validate, adminController.updateProductStatus);
router.get('/reports', adminController.listReports);
router.patch('/reports/:id', param('id').isMongoId(), body('status').isIn(['pending','reviewed','resolved','rejected']).withMessage('Invalid report status'), validate, adminController.updateReportStatus);
router.post('/email/test', body('to').isEmail(), validate, adminController.sendTestEmail);

module.exports = router;
