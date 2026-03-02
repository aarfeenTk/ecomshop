const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    res.status(200).json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    const user = await User.findById(req.user.id);

    // Check if product already in cart
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    // Populate cart for response
    await user.populate('cart.product');

    res.status(200).json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    const user = await User.findById(req.user.id);

    // Find item in cart
    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    user.cart[itemIndex].quantity = quantity;

    await user.save();

    // Populate cart for response
    await user.populate('cart.product');

    res.status(200).json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    const user = await User.findById(req.user.id);

    // Filter out the item
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    // Populate cart for response
    await user.populate('cart.product');

    res.status(200).json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
