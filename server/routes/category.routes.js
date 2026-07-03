const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const requireAuth = require('../middleware/authentication/requireAuth');
const requireVerifiedAccount = require('../middleware/authorization/requireVerifiedAccount');
const requireAdmin = require('../middleware/authorization/requireAdmin');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', categoryController.listCategories);
router.get('/:id', param('id').isMongoId(), validate, categoryController.getCategory);

router.post(
  '/',
  requireAuth,
  requireVerifiedAccount,
  requireAdmin,
  body('name').notEmpty().withMessage('Category name is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  validate,
  categoryController.createCategory
);

router.put(
  '/:id',
  requireAuth,
  requireVerifiedAccount,
  requireAdmin,
  param('id').isMongoId(),
  body('name').optional().notEmpty(),
  body('slug').optional().notEmpty(),
  validate,
  categoryController.updateCategory
);

router.delete('/:id', requireAuth, requireVerifiedAccount, requireAdmin, param('id').isMongoId(), validate, categoryController.deleteCategory);

module.exports = router;
