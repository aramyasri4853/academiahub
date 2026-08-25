const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check cookie first, then authorization header
    let token = req.cookies.token;
    
    if (!token && req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ error: 'Please authenticate.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_academiahub_key_12345');
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient privileges.' });
    }
    next();
  };
};

module.exports = { auth, requireRole };
