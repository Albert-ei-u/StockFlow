import nodemailer from 'nodemailer';
import VerificationCode from '../models/VerificationCode.js';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// Test email connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service not configured, using development mode');
  } else {
    console.log('Email service ready');
  }
});

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, purpose = 'verification') => {
  console.log(' Storing verification code in MongoDB:', { email, code, purpose });
  
  // Store verification code in MongoDB
  try {
    const actualPurpose = purpose === 'password_reset' ? 'password_reset' : 'email_verification';
    console.log(' Purpose mapping:', { originalPurpose: purpose, actualPurpose });
    
    const verificationRecord = await VerificationCode.create({
      email,
      code,
      purpose: actualPurpose
    });
    console.log(' Verification code stored successfully:', verificationRecord._id);
  } catch (error) {
    console.error(' Error storing verification code:', error);
    console.error(' Error details:', error.message);
    console.error(' Error stack:', error.stack);
  }

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured. Skipping email send.');
    console.log(`Verification code for ${email}: ${code}`);
    return true; // Return true to continue without email for development
  }

  const subject = purpose === 'password_reset' 
    ? 'Password Reset Code - SalesFlow'
    : 'Email Verification Code - SalesFlow';
    
  const html = purpose === 'password_reset'
    ? `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the code below to reset your password:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #2563eb;">${code}</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© 2026 SalesFlow. All rights reserved.</p>
      </div>
    `
    : `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for registering with SalesFlow. Use the code below to verify your email:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #2563eb;">${code}</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© 2026 SalesFlow. All rights reserved.</p>
      </div>
    `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured. Skipping email send.');
      console.log(`Verification code for ${email}: ${code}`);
      return true; // Return true to continue without email for development
    }

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.log(`Verification code for ${email}: ${code}`);
    return true; // Return true to continue the flow even if email fails
  }
};

// Verify code using MongoDB
export const verifyCode = async (email, code, purpose = 'verification') => {
  try {
    const verification = await VerificationCode.findOne({
      email,
      code,
      purpose: purpose === 'password_reset' ? 'password_reset' : 'email_verification',
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });
    
    if (!verification) {
      return { valid: false, message: 'No verification code found' };
    }
    
    if (Date.now() > verification.expiresAt) {
      await VerificationCode.deleteOne({ _id: verification._id });
      return { valid: false, message: 'Verification code expired' };
    }
    
    if (verification.code !== code) {
      return { valid: false, message: 'Invalid verification code' };
    }
    
    // Mark code as used
    await VerificationCode.updateOne(
      { _id: verification._id },
      { isUsed: true }
    );
    
    return { valid: true, message: 'Code verified successfully' };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { valid: false, message: 'Server error during verification' };
  }
};