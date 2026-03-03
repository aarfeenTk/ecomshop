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
    image: 'https://hottu.pk/cdn/shop/files/bh03-1.png?v=1742815054', // headphones
  },
  {
    name: 'Smartphone Case',
    description: 'Protective case for smartphones',
    price: 29.99,
    stock: 100,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=300&q=80', // phone case
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes for athletes',
    price: 129.99,
    stock: 30,
    category: 'Sports',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8rWSk8oD3-Ayr8iiUT3_h-foCQb6yXAzXFw&s', // running shoes
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker for home use',
    price: 89.99,
    stock: 20,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=300&q=80', // coffee maker
  },
  {
    name: 'Laptop Stand',
    description: 'Ergonomic laptop stand for better posture',
    price: 49.99,
    stock: 40,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=300&q=80', // laptop setup
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat for fitness enthusiasts',
    price: 39.99,
    stock: 60,
    category: 'Sports',
    image: 'https://apricot.com.pk/cdn/shop/files/Yoga-mat-for-Exercise-and-Fitness-Lilac5743-SA2553-14-Apricot-7493.jpg?v=1727602210', // yoga mat
  },
  {
    name: 'Cookbook',
    description: 'Collection of healthy recipes',
    price: 24.99,
    stock: 80,
    category: 'Books',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/2023/01/cookbook3.jpg', // cookbook
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 34.99,
    stock: 25,
    category: 'Home',
    image: 'https://image-cdn.ubuy.com/bohon-led-desk-lamp-with-usb-charging/400_400_100/693c54962fe8c1a7bf03be75.jpg', // desk lamp
  },
  {
    name: 'T-Shirt',
    description: 'Cotton t-shirt in various colors',
    price: 19.99,
    stock: 150,
    category: 'Clothing',
    image: 'https://tasweer.com.pk/cdn/shop/files/mustard_Hurricane_T-Shirt_Unisex.jpg?v=1729601769&width=533', // t-shirt
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with great sound quality',
    price: 79.99,
    stock: 35,
    category: 'Electronics',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV-MI-bQ0Xm6mnyNdQPwDCKCw8mO9OSeXXpw&s', // bluetooth speaker
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
