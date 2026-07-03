const requireSeller = (req, res, next) => {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({ success: false, message: 'Forbidden: seller access required' });
  }

  next();
};

module.exports = requireSeller;
