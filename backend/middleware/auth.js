import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sales flow is under development');

    // Get user from token
    const user = await User.findById(decoded.id).select('-password').populate('businessId');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.' 
      });
    }

    // Check if user is active (you might want to add an isActive field to User model)
    if (user.isActive === false) {
      return res.status(401).json({ 
        success: false,
        message: 'Account has been deactivated.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired.' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error in authentication.' 
    });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.` 
      });
    }

    next();
  };
};

// Business ownership verification
export const businessOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Authentication required.' 
      });
    }

    if (req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only business owners can perform this action.' 
      });
    }

    // Verify user owns the business they're trying to access
    const businessId = req.params.businessId || req.body.businessId || req.user.businessId?._id;
    
    if (businessId && req.user.businessId?._id.toString() !== businessId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only access your own business.' 
      });
    }

    next();
  } catch (error) {
    console.error('Business owner middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error in authorization.' 
    });
  }
};

// Same business verification (for employees to access their own business data)
export const sameBusiness = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Authentication required.' 
      });
    }

    const businessId = req.params.businessId || req.body.businessId;
    const userBusinessId = req.user.businessId?._id;

    if (!userBusinessId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. No business associated with this account.' 
      });
    }

    if (businessId && userBusinessId.toString() !== businessId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only access your business data.' 
      });
    }

    next();
  } catch (error) {
    console.error('Same business middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error in authorization.' 
    });
  }
};

// Optional authentication (doesn't fail if no token, but adds user if token exists)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sales flow is under development');
      const user = await User.findById(decoded.id).select('-password').populate('businessId');
      
      if (user && user.isActive !== false) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors, just continue without user
    next();
  }
};
