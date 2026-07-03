const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
  }

  next();
};

module.exports = requireAdmin;
