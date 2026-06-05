const productService = require('../services/product.service');

const listProducts = async (req, res, next) => {
  try {
    const filters = req.query;
    const products = await productService.listProducts(filters);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const payload = req.body;
    console.info('Create product payload:', payload);
    const product = await productService.createProduct(req.user.id, payload);
    console.info('Product saved response:', product);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.user, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
