const express = require('express');
const { body } = require('express-validator');
const promotionController = require('../controllers/promotion.controller');
const requireAuth = require('../middleware/authentication/requireAuth');
const requireVerifiedAccount = require('../middleware/authorization/requireVerifiedAccount');
const requireSeller = require('../middleware/authorization/requireSeller');
const validate = require('../middleware/validation.middleware');

const router = express.Router();
router.use(requireAuth, requireSeller, requireVerifiedAccount);

router.get('/plans', promotionController.getPromotionPlans);
router.post(
  '/purchase',
  body('productId').isMongoId().withMessage('Valid product id is required'),
  body('planId').isIn(['3_days', '7_days', '30_days']).withMessage('Invalid promotion plan'),
  validate,
  promotionController.purchasePromotion
);
router.get('/', promotionController.getSellerPromotions);

module.exports = router;
