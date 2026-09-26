const mongoose = require('mongoose');
const { createLocalModel } = require('../localModel');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'farmer', 'admin'], default: 'customer' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  district: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  farmName: { type: String, default: '' },
  farmLocation: { type: String, default: '' },
  village: { type: String, default: '' },
  farmSize: { type: String, default: '' },
  description: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const useLocalFallback = !process.env.MONGODB_URI || global.__LOCAL_DB__ === true;

module.exports = useLocalFallback ? createLocalModel({ collectionName: 'users' }) : mongoose.model('User', userSchema);
