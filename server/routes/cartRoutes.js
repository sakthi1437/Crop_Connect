const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('customer'), getCart);
router.post('/', protect, authorize('customer'), addToCart);
router.put('/:productId', protect, authorize('customer'), updateCartItem);
router.delete('/:productId', protect, authorize('customer'), removeFromCart);
router.delete('/', protect, authorize('customer'), clearCart);

module.exports = router;
