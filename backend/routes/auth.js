import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  register, 
  registerBusiness, 
  login, 
  joinBusiness, 
  getProfile,
  verifyEmailAndRegister,
  requestPasswordReset,
  verifyResetCodeAndResetPassword
} from '../controllers/authController.js';

const router = express.Router();

// Register Business Owner (sends verification email)
router.post('/register-business', registerBusiness);

// Verify email and complete registration
router.post('/verify-email-and-register', verifyEmailAndRegister);

// Register User (backward compatibility)
router.post('/register', register);

// Join Business (for employees)
router.post('/join-business', joinBusiness);

// Login
router.post('/login', login);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Verify  reset code and reset password
router.post('/verify-reset-code-and-reset-password', verifyResetCodeAndResetPassword);

// Get Profile (protected)
router.get('/profile', protect, getProfile);

export default router;
