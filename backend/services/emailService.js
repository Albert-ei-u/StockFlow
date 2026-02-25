import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your app password
  }
});

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, purpose = 'verification') => {
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
        <p style="color: #666; font-size: 12px;">© 2024 SalesFlow. All rights reserved.</p>
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
        <p style="color: #666; font-size: 12px;">© 2024 SalesFlow. All rights reserved.</p>
      </div>
    `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Store verification codes (in production, use Redis)
const verificationCodes = new Map();

// Store verification code with expiry
export const storeVerificationCode = (email, code, purpose = 'verification') => {
  const key = `${purpose}_${email}`;
  verificationCodes.set(key, {
    code,
    createdAt: Date.now(),
    expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
  });
};

// Verify code
export const verifyCode = (email, code, purpose = 'verification') => {
  const key = `${purpose}_${email}`;
  const stored = verificationCodes.get(key);
  
  if (!stored) {
    return { valid: false, message: 'No verification code found' };
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(key);
    return { valid: false, message: 'Verification code expired' };
  }
  
  if (stored.code !== code) {
    return { valid: false, message: 'Invalid verification code' };
  }
  
  // Remove used code
  verificationCodes.delete(key);
  return { valid: true, message: 'Code verified successfully' };
};