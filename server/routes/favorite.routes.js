const express = require('express');
const { param } = require('express-validator');
const favoriteController = require('../controllers/favorite.controller');
const requireAuth = require('../middleware/authentication/requireAuth');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', favoriteController.listFavorites);
router.get('/count', favoriteController.getFavoritesCount);
router.get('/check/:productId', param('productId').isMongoId(), validate, favoriteController.checkFavorite);
router.post('/:productId', param('productId').isMongoId(), validate, favoriteController.addFavorite);
router.delete('/:productId', param('productId').isMongoId(), validate, favoriteController.removeFavorite);

module.exports = router;
