const jwt = require('jsonwebtoken');
const Company = require('../models/companyModel');

// In-memory token blacklist (consider using Redis in production)
const tokenBlacklist = new Set();

exports.generateToken = (companyId) => {
  return jwt.sign({ companyId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if company exists and is active
    const company = await Company.findOne({ 
      companyId: decoded.companyId,
      isActive: true 
    });

    if (!company) {
      return res.status(401).json({ message: 'Invalid or inactive company' });
    }

    req.company = company;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.invalidateToken = (token) => {
  tokenBlacklist.add(token);
};

exports.clearExpiredTokens = () => {
  // Periodically clean up expired tokens from blacklist
  tokenBlacklist.forEach(token => {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        tokenBlacklist.delete(token);
      }
    }
  });
};