const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, quantity, unit, location, harvestDate, organic } = req.body;

    if (!name || !category || !description || !price || !quantity || !unit || !location) {
      return res.status(400).json({ success: false, message: 'Please fill in all required product fields.' });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({ success: false, message: 'Price and quantity cannot be negative.' });
    }

    const product = await Product.create({
      farmerId: req.user._id,
      farmerName: req.user.name,
      name,
      category,
      description,
      price: Number(price),
      quantity: Number(quantity),
      unit,
      image: req.file ? `/uploads/products/${req.file.filename}` : '',
      location,
      harvestDate,
      organic: Boolean(organic),
      status: Number(quantity) > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
    });

    return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while creating product.' });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, organic, status, search, location, minPrice, maxPrice } = req.query;
    const query = { status: { $ne: 'INACTIVE' } };

    if (category) query.category = category;
    if (organic !== undefined) query.organic = organic === 'true';
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch products.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch product.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not allowed to update this product.' });
    }

    const fieldsToUpdate = { ...req.body };
    if (req.file) fieldsToUpdate.image = `/uploads/products/${req.file.filename}`;
    if (fieldsToUpdate.quantity !== undefined && Number(fieldsToUpdate.quantity) <= 0) {
      fieldsToUpdate.status = 'OUT_OF_STOCK';
    }
    if (fieldsToUpdate.quantity !== undefined && Number(fieldsToUpdate.quantity) > 0) {
      fieldsToUpdate.status = 'AVAILABLE';
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, fieldsToUpdate, { new: true });
    return res.status(200).json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update product.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not allowed to delete this product.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to delete product.' });
  }
};

const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.params.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch farmer products.' });
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getFarmerProducts };
