import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes in the future
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster lookups
verificationCodeSchema.index({ email: 1, purpose: 1, isUsed: 1 });

export default mongoose.model('VerificationCode', verificationCodeSchema);