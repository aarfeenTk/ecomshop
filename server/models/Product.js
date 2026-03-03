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
  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries on active products
productSchema.index({ active: 1, isDeleted: 1 });

// Pre-find middleware to filter out deleted products by default
productSchema.pre(/^find/, function(next) {
  // Check if we should bypass the soft-delete filter (e.g., for cart population)
  const options = this.options || {};
  if (options.includeDeleted) {
    return next();
  }
  // Only filter in regular find operations, not in admin queries
  this.where({ isDeleted: false, active: true });
  next();
});

module.exports = mongoose.model('Product', productSchema);
