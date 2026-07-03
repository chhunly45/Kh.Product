const requireVerifiedAccount = (req, res, next) => {
  if (!req.user || !req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required to perform this action.'
    });
  }

  next();
};

module.exports = requireVerifiedAccount;
