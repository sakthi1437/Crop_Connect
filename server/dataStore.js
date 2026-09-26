const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const storeFile = path.join(__dirname, 'localData.json');

const ensureStore = () => {
  if (!fs.existsSync(storeFile)) {
    const defaultData = { users: [], products: [], carts: [], orders: [], reviews: [] };
    fs.writeFileSync(storeFile, JSON.stringify(defaultData, null, 2));
  }
  return JSON.parse(fs.readFileSync(storeFile, 'utf8'));
};

const saveStore = (data) => {
  fs.writeFileSync(storeFile, JSON.stringify(data, null, 2));
};

const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getStore = () => ensureStore();

const getUserById = (id) => {
  const { users } = getStore();
  return users.find((user) => user._id === id || user._id?.toString?.() === id?.toString?.());
};

const getUserByEmail = (email) => {
  const { users } = getStore();
  return users.find((user) => user.email?.toLowerCase?.() === String(email).toLowerCase());
};

const upsertUser = (user) => {
  const data = getStore();
  const index = data.users.findIndex((entry) => entry._id === user._id || entry.email?.toLowerCase?.() === user.email?.toLowerCase?.());
  if (index >= 0) {
    data.users[index] = { ...data.users[index], ...user };
  } else {
    data.users.push(user);
  }
  saveStore(data);
  return user;
};

const getProducts = (filters = {}) => {
  const { products } = getStore();
  return products.filter((product) => {
    const matches = [];
    if (filters.category) matches.push(product.category === filters.category);
    if (filters.organic !== undefined) matches.push(Boolean(product.organic) === Boolean(filters.organic));
    if (filters.location) matches.push(String(product.location || '').toLowerCase().includes(String(filters.location).toLowerCase()));
    if (filters.search) {
      const text = `${product.name} ${product.category} ${product.farmerName || ''} ${product.location || ''}`.toLowerCase();
      matches.push(text.includes(String(filters.search).toLowerCase()));
    }
    if (filters.minPrice !== undefined) matches.push(Number(product.price) >= Number(filters.minPrice));
    if (filters.maxPrice !== undefined) matches.push(Number(product.price) <= Number(filters.maxPrice));
    if (filters.status) matches.push(product.status === filters.status);
    if (filters.farmerId) matches.push(String(product.farmerId) === String(filters.farmerId));
    if (matches.length === 0) return true;
    return matches.every(Boolean);
  });
};

const createProductRecord = (product) => {
  const data = getStore();
  const record = { _id: generateId(), ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  data.products.push(record);
  saveStore(data);
  return record;
};

const updateProductRecord = (id, updates) => {
  const data = getStore();
  const index = data.products.findIndex((p) => String(p._id) === String(id));
  if (index === -1) return null;
  data.products[index] = { ...data.products[index], ...updates, updatedAt: new Date().toISOString() };
  saveStore(data);
  return data.products[index];
};

const deleteProductRecord = (id) => {
  const data = getStore();
  const before = data.products.length;
  data.products = data.products.filter((p) => String(p._id) !== String(id));
  saveStore(data);
  return before !== data.products.length;
};

const getProductById = (id) => {
  const { products } = getStore();
  return products.find((product) => String(product._id) === String(id));
};

const getCartForUser = (userId) => {
  const { carts } = getStore();
  return carts.find((cart) => String(cart.userId) === String(userId)) || { _id: generateId(), userId, items: [] };
};

const upsertCart = (cart) => {
  const data = getStore();
  const index = data.carts.findIndex((entry) => String(entry.userId) === String(cart.userId));
  if (index >= 0) {
    data.carts[index] = cart;
  } else {
    data.carts.push(cart);
  }
  saveStore(data);
  return cart;
};

const clearCartForUser = (userId) => {
  const data = getStore();
  data.carts = data.carts.filter((cart) => String(cart.userId) !== String(userId));
  saveStore(data);
};

const createOrderRecord = (order) => {
  const data = getStore();
  const record = { _id: generateId(), ...order, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  data.orders.push(record);
  saveStore(data);
  return record;
};

const getOrdersForUser = (userId, role) => {
  const { orders } = getStore();
  if (role === 'farmer') return orders.filter((order) => String(order.farmerId) === String(userId));
  return orders.filter((order) => String(order.customerId) === String(userId));
};

const getOrderById = (id) => {
  const { orders } = getStore();
  return orders.find((order) => String(order._id) === String(id));
};

const updateOrderRecord = (id, updates) => {
  const data = getStore();
  const index = data.orders.findIndex((order) => String(order._id) === String(id));
  if (index === -1) return null;
  data.orders[index] = { ...data.orders[index], ...updates, updatedAt: new Date().toISOString() };
  saveStore(data);
  return data.orders[index];
};

const createReviewRecord = (review) => {
  const data = getStore();
  const record = { _id: generateId(), ...review, createdAt: new Date().toISOString() };
  data.reviews.push(record);
  saveStore(data);
  return record;
};

const getReviewsForProduct = (productId) => {
  const { reviews } = getStore();
  return reviews.filter((review) => String(review.productId) === String(productId));
};

const resetStore = () => {
  saveStore({ users: [], products: [], carts: [], orders: [], reviews: [] });
};

module.exports = {
  getStore,
  saveStore,
  resetStore,
  generateId,
  getUserById,
  getUserByEmail,
  upsertUser,
  getProducts,
  createProductRecord,
  updateProductRecord,
  deleteProductRecord,
  getProductById,
  getCartForUser,
  upsertCart,
  clearCartForUser,
  createOrderRecord,
  getOrdersForUser,
  getOrderById,
  updateOrderRecord,
  createReviewRecord,
  getReviewsForProduct,
};
