const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');

const calculateDeliveryFee = (items) => items.length > 0 ? 35 : 0;

const placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const groupedByFarmer = {};
    for (const item of cart.items) {
      if (!item.productId || !item.productId._id) {
        return res.status(400).json({ success: false, message: 'One or more products are invalid.' });
      }

      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productName}` });
      }

      if (Number(item.quantity) > Number(product.quantity)) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const farmerId = product.farmerId.toString();
      if (!groupedByFarmer[farmerId]) {
        groupedByFarmer[farmerId] = {
          farmerId,
          farmerName: product.farmerName,
          items: [],
        };
      }

      groupedByFarmer[farmerId].items.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unit: item.unit,
        price: product.price,
        subtotal: product.price * item.quantity,
      });
    }

    const createdOrders = [];
    const farmerOrderIds = [];

    for (const group of Object.values(groupedByFarmer)) {
      const subtotal = group.items.reduce((sum, item) => sum + item.subtotal, 0);
      const totalAmount = subtotal + calculateDeliveryFee(group.items);
      const farmerUser = await User.findById(group.farmerId);

      const order = await Order.create({
        customerId: req.user._id,
        customerName: req.user.name,
        farmerId: group.farmerId,
        farmerName: group.farmerName || farmerUser?.name || 'Farmer',
        items: group.items,
        shippingAddress: shippingAddress || {
          name: req.user.name,
          phone: req.user.phone,
          address: req.user.address,
          city: req.user.city,
          district: req.user.district,
          state: req.user.state,
          pincode: req.user.pincode,
        },
        subtotal,
        deliveryFee: calculateDeliveryFee(group.items),
        totalAmount,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
      });

      farmerOrderIds.push(order._id);
      createdOrders.push(order);

      for (const item of group.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity = Math.max(0, product.quantity - item.quantity);
          product.status = product.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
          await product.save();
        }
      }
    }

    await Cart.findOneAndDelete({ userId: req.user._id });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { orders: createdOrders },
    });
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({ success: false, message: 'Unable to create order.' });
  }
};

const getOrders = async (req, res) => {
  try {
    const query = req.user.role === 'farmer'
      ? { farmerId: req.user._id }
      : { customerId: req.user._id };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch orders.' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.customerId.toString() !== req.user._id.toString() && order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch order details.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role === 'farmer' && order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own orders.' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    order.orderStatus = status;
    await order.save();

    return res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update order status.' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot cancel another customer order.' });
    }

    if (['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      order.orderStatus = 'CANCELLED';
      await order.save();

      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity += item.quantity;
          product.status = product.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
          await product.save();
        }
      }

      return res.status(200).json({ success: true, message: 'Order cancelled successfully', data: order });
    }

    return res.status(400).json({ success: false, message: 'This order cannot be cancelled in its current status.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to cancel order.' });
  }
};

module.exports = { placeOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder };
