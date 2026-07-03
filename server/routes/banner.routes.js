const express = require('express');
const { body, param, query } = require('express-validator');
const bannerController = require('../controllers/banner.controller');
const requireAuth = require('../middleware/authentication/requireAuth');
const requireVerifiedAccount = require('../middleware/authorization/requireVerifiedAccount');
const requireAdmin = require('../middleware/authorization/requireAdmin');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

// Public endpoint to fetch active banners
router.get('/active',
  query('position').optional().isIn(['top','inline','sidebar']),
  validate,
  bannerController.getActiveBanners
);

// Admin endpoints - protected
router.use(requireAuth, requireVerifiedAccount, requireAdmin);

router.get('/', bannerController.listBanners);

router.post('/',
  body('title').isString().notEmpty(),
  body('position').optional().isIn(['top','inline','sidebar']),
  body('enabled').optional().isBoolean(),
  validate,
  bannerController.createBanner
);

router.post('/upload', upload.single('image'), bannerController.uploadImage);

router.patch('/:id', param('id').isMongoId(), validate, bannerController.updateBanner);

router.delete('/:id', param('id').isMongoId(), validate, bannerController.deleteBanner);

module.exports = router;
