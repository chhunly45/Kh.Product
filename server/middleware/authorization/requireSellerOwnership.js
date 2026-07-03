const requireSellerOwnership = (req, res, next) => {
  const requestedSellerId = req.params.sellerId || req.query.sellerId;
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (requestedSellerId && String(requestedSellerId) !== String(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: cannot view other seller analytics' });
  }

  next();
};

module.exports = requireSellerOwnership;
