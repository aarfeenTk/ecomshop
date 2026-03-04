import mongoose, { Schema } from 'mongoose';
import { ProductDocument } from '../types';

const productSchema = new Schema<ProductDocument>({
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

productSchema.index({ active: 1, isDeleted: 1 });

productSchema.pre(/^find/, function(this: any, next) {
  const options = this.getOptions() || {};
  if (options.includeDeleted) {
    return next();
  }
  this.where({ isDeleted: false, active: true });
  next();
});

export default mongoose.model<ProductDocument>('Product', productSchema);
