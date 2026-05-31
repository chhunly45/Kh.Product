const adminService = require('../services/admin.service');

const getOverview = async (req, res, next) => {
  try {
    const overview = await adminService.getOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await adminService.listUsers(req.query);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserStatus(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const products = await adminService.listProducts(req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const product = await adminService.updateProductStatus(req.params.id, req.body.status);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const listReports = async (req, res, next) => {
  try {
    const reports = await adminService.listReports(req.query);
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const report = await adminService.updateReportStatus(req.params.id, req.body.status, req.user.id);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  listUsers,
  updateUserStatus,
  listProducts,
  updateProductStatus,
  listReports,
  updateReportStatus
};
