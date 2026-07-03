const requireOwner = (resourceOwnerField = 'userId') => (req, res, next) => {
  const resourceOwner = req.params[resourceOwnerField] || req.body?.[resourceOwnerField];
  const currentUserId = req.user?.id;

  if (!currentUserId || (resourceOwner && String(resourceOwner) !== String(currentUserId))) {
    return res.status(403).json({ success: false, message: 'Forbidden: ownership required' });
  }

  next();
};

module.exports = requireOwner;
