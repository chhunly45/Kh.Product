const { Favorite, Product } = require('../models');

const getFavorites = async (userId) => {
  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: 'product',
      populate: [
        { path: 'seller', select: 'displayName profileImageUrl location verified' },
        { path: 'category', select: 'name labelKh' },
        { path: 'images' }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

  return favorites.map((favorite) => favorite.product).filter(Boolean);
};

const getFavoriteIds = async (userId) => {
  const favorites = await Favorite.find({ user: userId }).select('product').lean();
  return favorites.map((favorite) => favorite.product.toString());
};

const getFavoritesCount = async (userId) => {
  return Favorite.countDocuments({ user: userId });
};

const checkFavorite = async (userId, productId) => {
  return Favorite.exists({ user: userId, product: productId });
};

const addFavorite = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product || product.status !== 'published') {
    const error = new Error('Product not available');
    error.statusCode = 404;
    throw error;
  }

  const favorite = await Favorite.findOneAndUpdate(
    { user: userId, product: productId },
    { user: userId, product: productId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return favorite;
};

const removeFavorite = async (userId, productId) => {
  await Favorite.deleteOne({ user: userId, product: productId });
};

module.exports = {
  getFavorites,
  getFavoriteIds,
  getFavoritesCount,
  checkFavorite,
  addFavorite,
  removeFavorite
};
