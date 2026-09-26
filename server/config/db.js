const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI configured. Using local JSON data layer for development.');
      global.__LOCAL_DB__ = true;
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.__LOCAL_DB__ = false;
  } catch (error) {
    console.warn('MongoDB connection failed. Falling back to local JSON data layer.');
    global.__LOCAL_DB__ = true;
  }
};

module.exports = connectDB;
