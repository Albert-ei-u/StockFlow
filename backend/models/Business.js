import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  businessCode: {
    type: String,
    required: [true, 'Business code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Business = mongoose.model('Business', businessSchema);

export default Business;
