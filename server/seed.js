require('dotenv').config();
const bcrypt = require('bcryptjs');
const dataStore = require('./dataStore');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      dataStore.resetStore();
      console.log('Seeding local JSON database...');
    }

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);
    const farmerPassword = await bcrypt.hash('farmer123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@cropconnect.com',
      phone: '9999999999',
      password: adminPassword,
      role: 'admin',
      city: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625001',
    });

    const customer = await User.create({
      name: 'Customer One',
      email: 'customer1@cropconnect.com',
      phone: '8888888888',
      password: customerPassword,
      role: 'customer',
      address: '10 Main Street',
      city: 'Madurai',
      district: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625018',
    });

    const farmer1 = await User.create({
      name: 'Ravi Kumar',
      email: 'farmer1@cropconnect.com',
      phone: '7777777777',
      password: farmerPassword,
      role: 'farmer',
      farmName: 'Ravi Organic Farms',
      farmLocation: 'Perungudi',
      village: 'Perungudi',
      district: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625014',
      description: 'Vegetable grower focused on organic produce.',
      verificationStatus: 'verified',
    });

    const farmer2 = await User.create({
      name: 'Arun Kumar',
      email: 'farmer2@cropconnect.com',
      phone: '6666666666',
      password: farmerPassword,
      role: 'farmer',
      farmName: 'Arun Fruit Valley',
      farmLocation: 'Theni',
      village: 'Cumbum',
      district: 'Theni',
      state: 'Tamil Nadu',
      pincode: '625516',
      description: 'Fruit producer with fresh seasonal harvests.',
      verificationStatus: 'verified',
    });

    const productData = [
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Tomato', category: 'Vegetables', description: 'Farm fresh red tomatoes', price: 40, quantity: 120, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: true, status: 'AVAILABLE', image: '/uploads/products/tomato.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Onion', category: 'Vegetables', description: 'Fresh onion from local farms', price: 35, quantity: 150, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/onion.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Potato', category: 'Vegetables', description: 'High quality potato tubers', price: 30, quantity: 200, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/potato.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Carrot', category: 'Vegetables', description: 'Sweet and crunchy carrots', price: 55, quantity: 80, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: true, status: 'AVAILABLE', image: '/uploads/products/carrot.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Brinjal', category: 'Vegetables', description: 'Fresh purple brinjal', price: 45, quantity: 90, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/brinjal.jpg' },
      { farmerId: farmer2._id, farmerName: farmer2.name, name: 'Banana', category: 'Fruits', description: 'Sweet and ripe banana bunches', price: 60, quantity: 70, unit: 'dozen', location: 'Theni, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/banana.jpg' },
      { farmerId: farmer2._id, farmerName: farmer2.name, name: 'Mango', category: 'Fruits', description: 'Seasonal mangoes from Theni', price: 120, quantity: 50, unit: 'kg', location: 'Theni, Tamil Nadu', harvestDate: new Date(), organic: true, status: 'AVAILABLE', image: '/uploads/products/mango.jpg' },
      { farmerId: farmer2._id, farmerName: farmer2.name, name: 'Papaya', category: 'Fruits', description: 'Fresh papaya with rich flavor', price: 70, quantity: 60, unit: 'piece', location: 'Theni, Tamil Nadu', harvestDate: new Date(), organic: true, status: 'AVAILABLE', image: '/uploads/products/papaya.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Rice', category: 'Grains', description: 'Premium paddy rice', price: 32, quantity: 300, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/rice.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Wheat', category: 'Grains', description: 'Fresh wheat grain', price: 28, quantity: 220, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/wheat.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Groundnut', category: 'Pulses', description: 'Roasted groundnut seeds', price: 90, quantity: 80, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: true, status: 'AVAILABLE', image: '/uploads/products/groundnut.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Turmeric', category: 'Spices', description: 'Fresh turmeric rhizome', price: 150, quantity: 60, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: true, status: 'AVAILABLE', image: '/uploads/products/turmeric.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Chilli', category: 'Spices', description: 'Hot red chilli', price: 80, quantity: 100, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/chilli.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Coriander', category: 'Spices', description: 'Fresh coriander leaves and seeds', price: 50, quantity: 70, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: true, status: 'AVAILABLE', image: '/uploads/products/coriander.jpg' },
      { farmerId: farmer1._id, farmerName: farmer1.name, name: 'Green Gram', category: 'Pulses', description: 'Protein-packed green gram', price: 85, quantity: 90, unit: 'kg', location: 'Madurai, Tamil Nadu', harvestDate: new Date(), organic: false, status: 'AVAILABLE', image: '/uploads/products/greengram.jpg' },
    ];

    const createdProducts = await Product.insertMany(productData);

    const order1 = await Order.create({
      customerId: customer._id,
      customerName: customer.name,
      farmerId: farmer1._id,
      farmerName: farmer1.name,
      items: [
        { productId: createdProducts[0]._id, productName: createdProducts[0].name, quantity: 10, unit: 'kg', price: 40, subtotal: 400 },
      ],
      shippingAddress: {
        name: customer.name,
        phone: customer.phone,
        address: '10 Main Street',
        city: 'Madurai',
        district: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625018',
      },
      subtotal: 400,
      deliveryFee: 35,
      totalAmount: 435,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'PENDING',
      orderStatus: 'DELIVERED',
    });

    await Review.create({
      customerId: customer._id,
      customerName: customer.name,
      productId: createdProducts[0]._id,
      farmerId: farmer1._id,
      orderId: order1._id,
      rating: 5,
      comment: 'Fresh and excellent quality tomatoes.',
    });

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
