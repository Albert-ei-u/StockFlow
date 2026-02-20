import express from 'express';
import { register, registerBusiness, login, joinBusiness, getProfile } from '../controllers/authController.js';

const router = express.Router();

// Register Business Owner
router.post('/register-business', registerBusiness);

// Register User (backward compatibility)
router.post('/register', register);

// Join Business (for employees)
router.post('/join-business', joinBusiness);

// Login
router.post('/login', login);

// Get Profile
router.get('/profile', getProfile);

export default router;
