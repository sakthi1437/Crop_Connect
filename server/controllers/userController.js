const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    return res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update profile.' });
  }
};

const getDashboard = async (req, res) => {
  try {
    if (req.user.role === 'farmer') {
      const products = await Product.find({ farmerId: req.user._id });
      const orders = await Order.find({ farmerId: req.user._id });
      const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const pendingOrders = orders.filter((order) => order.orderStatus === 'PENDING').length;
      const completedOrders = orders.filter((order) => order.orderStatus === 'DELIVERED').length;

      return res.status(200).json({
        success: true,
        data: {
          totalProducts: products.length,
          activeProducts: products.filter((p) => p.status === 'AVAILABLE').length,
          pendingOrders,
          completedOrders,
          totalSales,
          recentOrders: orders.slice(0, 5),
          products,
        },
      });
    }

    const orders = await Order.find({ customerId: req.user._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.orderStatus === 'PENDING').length,
        deliveredOrders: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
        totalSpent,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch dashboard data.' });
  }
};

module.exports = { getProfile, updateProfile, getDashboard };
