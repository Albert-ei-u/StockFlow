import express from 'express';
import { register, login, joinBusiness, getProfile } from '../controllers/authController.js';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Join business route
router.post('/join-business', joinBusiness);

// Get profile route (protected)
router.get('/profile', getProfile);


export default router;
