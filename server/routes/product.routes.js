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
  query('sort').optional().isIn(['newest', 'priceAsc', 'priceDesc']),
  validate,
  productController.listProducts
);

router.get('/featured', validate, productController.listFeaturedProducts);
router.get('/:id', param('id').isMongoId(), validate, productController.getProduct);
router.post('/:id/views', param('id').isMongoId(), validate, productController.addProductView);

router.post(
  '/',
  authMiddleware,
  body('title').optional().trim().isString(),
  body('titleKh').optional().trim().isString(),
  body('titleEn').optional().trim().isString(),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category is required'),
  validate,
  productController.createProduct
);

router.put('/:id', authMiddleware, param('id').isMongoId(), validate, productController.updateProduct);
router.delete('/:id', authMiddleware, param('id').isMongoId(), validate, productController.deleteProduct);

module.exports = router;
