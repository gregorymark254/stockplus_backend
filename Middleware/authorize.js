// api roles
const authorize = (roles) => {
    return (req, res, next) => {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    };
};

module.exports = authorize