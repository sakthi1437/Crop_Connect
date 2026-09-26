const mongoose = require('mongoose');
const { createLocalModel } = require('../localModel');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      farmerName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unit: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      image: { type: String, default: '' },
      subtotal: { type: Number, required: true, min: 0 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const useLocalFallback = !process.env.MONGODB_URI || global.__LOCAL_DB__ === true;

module.exports = useLocalFallback ? createLocalModel({ collectionName: 'carts' }) : mongoose.model('Cart', cartSchema);
