import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Business from '../models/Business.js';
import VerificationCode from '../models/VerificationCode.js';
import { sendVerificationEmail, generateVerificationCode } from '../services/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sales flow is under development', {
    expiresIn: '30d'
  });
};

// Register Business Owner (simplified - no email verification)
export const registerBusiness = async (req, res) => {
  try {
    const { name, email, password, businessName, businessDescription } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if business already exists
    const existingBusiness = await Business.findOne({ name: businessName });
    if (existingBusiness) {
      return res.status(400).json({ message: 'Business already exists with this name' });
    }

    // Generate unique business code
    const businessCode = generateBusinessCode();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create business
    const business = new Business({
      name: businessName,
      description: businessDescription,
      businessCode
    });
    await business.save();

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'owner',
      businessId: business._id
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Business registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId
      },
      business: {
        _id: business._id,
        name: business.name,
        description: business.description,
        businessCode: business.businessCode
      }
    });
  } catch (error) {
    console.error('Register business error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Generate Business Code
const generateBusinessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Register User (for backward compatibility)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).populate('businessId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        createdAt: user.createdAt
      },
      business: user.businessId,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Join Business (for employees)
export const joinBusiness = async (req, res) => {
  try {
    const { name, email, password, businessCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find business by code
    const business = await Business.findOne({ businessCode });
    if (!business) {
      return res.status(400).json({ message: 'Invalid business code' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employee user
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      role: 'staff', // All employees start as staff
      businessId: business._id
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Joined business successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        createdAt: user.createdAt
      },
      business: {
        _id: business._id,
        name: business.name,
        description: business.description,
        businessCode: business.businessCode
      },
      token
    });
  } catch (error) {
    console.error('Join business error:', error);
    res.status(500).json({ message: 'Server error while joining business' });
  }
};

// Get Current User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('businessId').select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        createdAt: user.createdAt
      },
      business: user.businessId
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// New function to verify email and complete registration
export const verifyEmailAndRegister = async (req, res) => {
  try {
    console.log('🔍 Backend verification started');
    console.log('📧 Request body:', req.body);
    
    const { email, code, name, password, businessName, businessDescription } = req.body;
    
    console.log('🔍 Looking for verification code with:', { email, code, purpose: 'email_verification' });

    // Verify the code
    const verification = await VerificationCode.findOne({
      email,
      code,
      purpose: 'email_verification',
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    console.log('📋 Found verification record:', verification);

    if (!verification) {
      console.log('❌ No valid verification code found');
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    console.log('✅ Verification code is valid');

    // Mark code as used
    verification.isUsed = true;
    await verification.save();
    console.log('💾 Marked verification code as used');

    // Generate unique business code
    const businessCode = generateBusinessCode();
    console.log('🏢 Generated business code:', businessCode);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('🔐 Password hashed');

    // Create business
    const business = new Business({
      name: businessName,
      description: businessDescription,
      businessCode
    });
    await business.save();
    console.log('🏢 Business created:', business._id);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'owner',
      businessId: business._id
    });
    await user.save();
    console.log('👤 User created:', user._id);

    // Generate token
    const token = generateToken(user._id);
    console.log('🎫 JWT token generated');

    const responseData = {
      message: 'Registration completed successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId
      },
      business: {
        _id: business._id,
        name: business.name,
        description: business.description,
        businessCode: business.businessCode
      }
    };

    console.log('📤 Sending response:', responseData);
    res.status(201).json(responseData);
    console.log('✅ Registration completed successfully');
  } catch (error) {
    console.error('❌ Verification error:', error);
  }
};

// New function to request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store verification code
    await VerificationCode.create({
      email,
      code: verificationCode,
      purpose: 'password_reset'
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode, 'password_reset');
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }

    res.status(200).json({
      message: 'Password reset code sent to your email',
      requiresVerification: true,
      email: email
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// New function to verify reset code and reset password
export const verifyResetCodeAndResetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Verify the code
    const verification = await VerificationCode.findOne({
      email,
      code,
      purpose: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!verification) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Mark code as used
    verification.isUsed = true;
    await verification.save();

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Verify reset code and reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
