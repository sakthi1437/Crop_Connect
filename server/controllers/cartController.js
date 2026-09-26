const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch cart.' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.status === 'OUT_OF_STOCK' || product.quantity <= 0) {
      return res.status(400).json({ success: false, message: 'This product is currently unavailable.' });
    }

    const requestedQty = Number(quantity);
    if (requestedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + requestedQty;

    if (newQuantity > product.quantity) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock.' });
    }

    const subtotal = Number(product.price) * newQuantity;

    if (existingItem) {
      existingItem.quantity = newQuantity;
      existingItem.unit = product.unit;
      existingItem.price = product.price;
      existingItem.subtotal = subtotal;
      existingItem.image = product.image;
      existingItem.farmerId = product.farmerId;
      existingItem.farmerName = product.farmerName;
      existingItem.productName = product.name;
    } else {
      cart.items.push({
        productId: product._id,
        productName: product.name,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        quantity: requestedQty,
        unit: product.unit,
        price: product.price,
        image: product.image,
        subtotal: Number(product.price) * requestedQty,
      });
    }

    await cart.save();
    return res.status(200).json({ success: true, message: 'Product added to cart', data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to add product to cart.' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.find((entry) => entry.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product no longer exists.' });
    }

    const newQty = Number(quantity);
    if (newQty <= 0) {
      cart.items = cart.items.filter((entry) => entry.productId.toString() !== productId);
      await cart.save();
      return res.status(200).json({ success: true, message: 'Item removed from cart', data: cart });
    }

    if (newQty > product.quantity) {
      return res.status(400).json({ success: false, message: 'Quantity exceeds available stock.' });
    }

    item.quantity = newQty;
    item.subtotal = newQty * item.price;
    await cart.save();
    return res.status(200).json({ success: true, message: 'Cart updated', data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update cart.' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId);
    await cart.save();
    return res.status(200).json({ success: true, message: 'Product removed from cart', data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to remove cart item.' });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to clear cart.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
