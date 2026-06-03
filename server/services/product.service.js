const { Product, Category, User } = require('../models');

const listProducts = async (filters) => {
  const query = { status: 'published' };
  const locationFilters = [];

  if (filters.category) query.category = filters.category;
  if (filters.province) locationFilters.push({ location: new RegExp(filters.province, 'i') });
  if (filters.location) locationFilters.push({ location: new RegExp(filters.location, 'i') });
  if (locationFilters.length) query.$and = [...(query.$and || []), ...locationFilters];
  if (filters.minPrice) query.price = { ...query.price, $gte: Number(filters.minPrice) };
  if (filters.maxPrice) query.price = { ...query.price, $lte: Number(filters.maxPrice) };
  if (filters.condition) query.condition = filters.condition;
  const searchTerm = filters.search || filters.q;
  if (searchTerm) query.$text = { $search: searchTerm };

  if (filters.datePosted) {
    const now = new Date();
    let cutoff;
    if (filters.datePosted === '24h') cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (filters.datePosted === '7d') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (filters.datePosted === '30d') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (filters.datePosted === '90d') cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    if (cutoff) query.createdAt = { ...query.createdAt, $gte: cutoff };
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.perPage) || 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(query)
      .populate('seller', 'displayName profileImageUrl location')
      .populate('category', 'name labelKh slug')
      .populate('images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  return { items, meta: { page, limit, total } };
};

const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate('seller', 'displayName profileImageUrl location email')
    .populate('category', 'name labelKh slug')
    .populate('images');

  if (!product || product.status === 'archived') {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  product.viewsCount += 1;
  await product.save();
  return product;
};

const createProduct = async (sellerId, payload) => {
  await Category.findById(payload.category).orFail();
  const product = await Product.create({
    seller: sellerId,
    title: payload.title,
    slug: payload.slug || payload.title.toLowerCase().replace(/\s+/g, '-'),
    description: payload.description,
    price: payload.price,
    currency: payload.currency || 'KHR',
    condition: payload.condition || 'used',
    location: payload.location,
    category: payload.category,
    tags: payload.tags || [],
    metaTitle: payload.metaTitle || payload.title,
    metaDescription: payload.metaDescription || payload.description,
    extraAttributes: payload.extraAttributes || {}
  });
  return product;
};

const updateProduct = async (productId, user, updates) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = product.seller.toString() === user.id.toString();
  const isAdmin = ['admin', 'moderator'].includes(user.role);
  if (!isOwner && !isAdmin) {
    const error = new Error('Permission denied');
    error.statusCode = 403;
    throw error;
  }

  Object.keys(updates).forEach((key) => {
    if (['title', 'description', 'price', 'condition', 'location', 'status', 'category', 'tags', 'metaTitle', 'metaDescription', 'extraAttributes'].includes(key)) {
      product[key] = updates[key];
    }
  });

  if (updates.category) {
    await Category.findById(updates.category).orFail();
  }

  await product.save();
  return product;
};

const deleteProduct = async (productId, user) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = product.seller.toString() === user.id.toString();
  const isAdmin = ['admin', 'moderator'].includes(user.role);
  if (!isOwner && !isAdmin) {
    const error = new Error('Permission denied');
    error.statusCode = 403;
    throw error;
  }

  await product.deleteOne();
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
