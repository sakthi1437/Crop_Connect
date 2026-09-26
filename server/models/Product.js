const mongoose = require('mongoose');
const { createLocalModel } = require('../localModel');

const productSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Cereals', 'Spices', 'Oil Seeds', 'Other'],
    required: true,
  },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'],
    required: true,
  },
  image: { type: String, default: '' },
  location: { type: String, required: true },
  harvestDate: { type: Date },
  organic: { type: Boolean, default: false },
  status: { type: String, enum: ['AVAILABLE', 'OUT_OF_STOCK', 'INACTIVE'], default: 'AVAILABLE' },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

productSchema.index({ name: 'text', category: 1, location: 1, farmerId: 1, status: 1 });

const useLocalFallback = !process.env.MONGODB_URI || global.__LOCAL_DB__ === true;

module.exports = useLocalFallback ? createLocalModel({ collectionName: 'products' }) : mongoose.model('Product', productSchema);
