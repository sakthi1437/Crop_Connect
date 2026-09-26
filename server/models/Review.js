const mongoose = require('mongoose');
const { createLocalModel } = require('../localModel');

const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

reviewSchema.index({ productId: 1, orderId: 1 }, { unique: true });

const useLocalFallback = !process.env.MONGODB_URI || global.__LOCAL_DB__ === true;

module.exports = useLocalFallback ? createLocalModel({ collectionName: 'reviews' }) : mongoose.model('Review', reviewSchema);
