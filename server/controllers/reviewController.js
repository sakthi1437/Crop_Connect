const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Product, order, and rating are required.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own orders.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const alreadyReviewed = await Review.findOne({ productId, orderId, customerId: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product for this order.' });
    }

    const review = await Review.create({
      customerId: req.user._id,
      customerName: req.user.name,
      productId,
      farmerId: product.farmerId,
      orderId,
      rating: Number(rating),
      comment: comment || '',
    });

    const reviews = await Review.find({ productId });
    const averageRating = reviews.reduce((sum, reviewItem) => sum + reviewItem.rating, 0) / reviews.length;
    product.rating = averageRating;
    await product.save();

    return res.status(201).json({ success: true, message: 'Review added successfully', data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to add review.' });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch reviews.' });
  }
};

module.exports = { createReview, getProductReviews };
