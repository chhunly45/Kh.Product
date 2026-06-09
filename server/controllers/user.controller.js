const User = require('../models/User');
const Product = require('../models/Product');
const Favorite = require('../models/Favorite');
const authService = require('../services/auth.service');

const getProfileById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshTokens');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const products = await Product.find({ seller: user._id }).select('_id viewsCount').lean();
    const productIds = products.map((product) => product._id);
    const totalViews = products.reduce((sum, product) => sum + (product.viewsCount || 0), 0);
    const favoritesCount = productIds.length
      ? await Favorite.countDocuments({ product: { $in: productIds } })
      : 0;

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          totalProducts: products.length,
          totalViews,
          favoritesCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await authService.updateProfile(req.user.id, updates);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileById,
  updateProfile
};
