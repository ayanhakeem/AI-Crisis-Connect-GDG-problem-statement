const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`🚫 Access Denied for ${req.user.email}: Has role [${req.user.role}], but needs [${roles.join(' or ')}]`);
      return res.status(403).json({
        message: `Forbidden: This action requires ${roles.join(' or ')} privileges.`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
