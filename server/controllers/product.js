const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments({ isDeleted: false });

    // Get products sorted by newest first
    const products = await Product.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Check for active orders for each product
    const productsWithOrderInfo = await Promise.all(
      products.map(async (product) => {
        const activeOrdersCount = await Order.countDocuments({
          'orderItems.product': product._id,
          status: { $in: ['Pending', 'Approved', 'Shipped'] }
        });

        return {
          ...product.toObject(),
          hasActiveOrders: activeOrdersCount > 0,
          activeOrdersCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: productsWithOrderInfo.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: productsWithOrderInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete product (Soft Delete)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 * @note    Checks for active orders before deleting
 *          If active orders exist, returns error with count
 *          Otherwise, marks product as deleted (soft delete)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check for active orders containing this product
    const activeOrders = await Order.find({
      'orderItems.product': req.params.id,
      status: { $in: ['Pending', 'Approved', 'Shipped'] }
    });

    if (activeOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product with active orders`,
        activeOrdersCount: activeOrders.length,
        canSoftDelete: true,
        suggestion: 'Mark product as unavailable instead'
      });
    }

    // Soft delete: Mark as deleted instead of removing
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.active = false;
    product.stock = 0;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product marked as unavailable (soft deleted)',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Soft delete product (alternative endpoint)
 * @route   PATCH /api/products/:id/soft-delete
 * @access  Private/Admin
 * @note    Explicitly marks product as unavailable without checking orders
 */
exports.softDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Soft delete
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.active = false;
    product.stock = 0;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product marked as unavailable',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
