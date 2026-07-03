const express = require('express');
const { body, param } = require('express-validator');
const requireAuth = require('../middleware/authentication/requireAuth');
const requireVerifiedAccount = require('../middleware/authorization/requireVerifiedAccount');
const upload = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  requireVerifiedAccount,
  upload.array('images', 6),
  body('productId').optional().isMongoId().withMessage('Product ID must be a valid id'),
  validate,
  uploadController.uploadImages
);

router.delete(
  '/:id',
  requireAuth,
  requireVerifiedAccount,
  param('id').isMongoId().withMessage('Image ID is required'),
  validate,
  uploadController.deleteImage
);

module.exports = router;
