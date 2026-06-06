const express = require('express');
const { body, param, query } = require('express-validator');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/',
  query('search').optional().trim().isString(),
  query('category').optional().isMongoId(),
  query('seller').optional().isMongoId(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('province').optional().trim().isString(),
  query('condition').optional().isIn(['new', 'used', 'refurbished']),
  query('datePosted').optional().isIn(['24h', '7d', '30d', '90d']),
  validate,
  productController.listProducts
);

router.get('/:id', param('id').isMongoId(), validate, productController.getProduct);

router.post(
  '/',
  authMiddleware,
  body('title').notEmpty().withMessage('Product title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category is required'),
  validate,
  productController.createProduct
);

router.put('/:id', authMiddleware, param('id').isMongoId(), validate, productController.updateProduct);
router.delete('/:id', authMiddleware, param('id').isMongoId(), validate, productController.deleteProduct);

module.exports = router;
