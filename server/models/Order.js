const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price must be positive'],
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price must be positive'],
  },
  shippingDetails: {
    fullName: {
      type: String,
      required: [true, 'Please add full name'],
    },
    email: {
      type: String,
      required: [true, 'Please add email'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please add address'],
    },
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash on Delivery'],
    required: [true, 'Please select payment method'],
  },
  transactionReference: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Shipped', 'Delivered'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
