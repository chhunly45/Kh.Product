const express = require('express');
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const uploadRoutes = require('./upload.routes');
const chatRoutes = require('./chat.routes');
const favoriteRoutes = require('./favorite.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/upload', uploadRoutes);
router.use('/chats', chatRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
