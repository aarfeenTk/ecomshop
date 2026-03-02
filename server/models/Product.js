const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: [0, 'Price must be positive'],
  },
  stock: {
    type: Number,
    required: [true, 'Please add product stock'],
    min: [0, 'Stock must be positive'],
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Please add a product category'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please add a product image'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
