import express from 'express';
import { register, registerBusiness, login, joinBusiness, getProfile } from '../controllers/authController.js';
import { 
  authLimiter, 
  validateBusinessRegistration, 
  validateUserRegistration, 
  validateJoinBusiness, 
  validateLogin,
  protect,
  auditLog
} from '../middleware/index.js';

const router = express.Router();

// Register Business Owner
router.post('/register-business', 
  authLimiter,
  validateBusinessRegistration,
  auditLog('CREATE', 'BUSINESS'),
  registerBusiness
);

// Register User (backward compatibility)
router.post('/register', 
  authLimiter,
  validateUserRegistration,
  auditLog('CREATE', 'USER'),
  register
);

// Join Business (for employees)
router.post('/join-business', 
  authLimiter,
  validateJoinBusiness,
  auditLog('CREATE', 'EMPLOYEE'),
  joinBusiness
);

// Login
router.post('/login', 
  authLimiter,
  validateLogin,
  auditLog('LOGIN', 'AUTH'),
  login
);

// Get Profile
router.get('/profile', 
  protect,
  auditLog('READ', 'PROFILE'),
  getProfile
);

export default router;
