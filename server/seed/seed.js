require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');

connectDB();

const importData = async () => {
  try {
    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin',
      });
      console.log('Admin user created - Email: admin@example.com, Password: 123456');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample products if none exist
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      const sampleProducts = [
        {
          name: 'Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 199.99,
          stock: 50,
          category: 'Electronics',
          image: 'https://via.placeholder.com/300x300?text=Wireless+Headphones',
        },
        {
          name: 'Smartphone Case',
          description: 'Protective case for smartphones',
          price: 29.99,
          stock: 100,
          category: 'Accessories',
          image: 'https://via.placeholder.com/300x300?text=Smartphone+Case',
        },
        {
          name: 'Running Shoes',
          description: 'Comfortable running shoes for athletes',
          price: 129.99,
          stock: 30,
          category: 'Sports',
          image: 'https://via.placeholder.com/300x300?text=Running+Shoes',
        },
        {
          name: 'Coffee Maker',
          description: 'Automatic coffee maker for home use',
          price: 89.99,
          stock: 20,
          category: 'Home',
          image: 'https://via.placeholder.com/300x300?text=Coffee+Maker',
        },
        {
          name: 'Laptop Stand',
          description: 'Ergonomic laptop stand for better posture',
          price: 49.99,
          stock: 40,
          category: 'Electronics',
          image: 'https://via.placeholder.com/300x300?text=Laptop+Stand',
        },
        {
          name: 'Yoga Mat',
          description: 'Non-slip yoga mat for fitness enthusiasts',
          price: 39.99,
          stock: 60,
          category: 'Sports',
          image: 'https://via.placeholder.com/300x300?text=Yoga+Mat',
        },
        {
          name: 'Cookbook',
          description: 'Collection of healthy recipes',
          price: 24.99,
          stock: 80,
          category: 'Books',
          image: 'https://via.placeholder.com/300x300?text=Cookbook',
        },
        {
          name: 'Desk Lamp',
          description: 'LED desk lamp with adjustable brightness',
          price: 34.99,
          stock: 25,
          category: 'Home',
          image: 'https://via.placeholder.com/300x300?text=Desk+Lamp',
        },
        {
          name: 'T-Shirt',
          description: 'Cotton t-shirt in various colors',
          price: 19.99,
          stock: 150,
          category: 'Clothing',
          image: 'https://via.placeholder.com/300x300?text=T-Shirt',
        },
        {
          name: 'Bluetooth Speaker',
          description: 'Portable Bluetooth speaker with great sound quality',
          price: 79.99,
          stock: 35,
          category: 'Electronics',
          image: 'https://via.placeholder.com/300x300?text=Bluetooth+Speaker',
        },
      ];
      await Product.insertMany(sampleProducts);
      console.log('Sample products created');
    } else {
      console.log('Sample products already exist');
    }

    console.log('Data Import Success');
    process.exit();
  } catch (error) {
    console.error('Data Import Error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    console.log('Data Destroyed');
    process.exit();
  } catch (error) {
    console.error('Data Destroy Error:', error);
    process.exit(1);
  }
};

// Run based on command
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
