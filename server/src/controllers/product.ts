import { Request, Response } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import { ApiResponse, Product as ProductType } from '../types';

interface ProductQuery {
  page?: string;
  limit?: string;
}

interface ProductBody extends Partial<ProductType> {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

export const getProducts = async (req: Request<{}, {}, {}, ProductQuery>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({ isDeleted: false });

    const products = await Product.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
      error: (error as Error).message,
    });
  }
};

export const getProduct = async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const createProduct = async (req: Request<{}, {}, ProductBody>, res: Response<ApiResponse>): Promise<void> => {
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
      error: (error as Error).message,
    });
  }
};

export const updateProduct = async (req: Request<{ id: string }, {}, ProductBody>, res: Response<ApiResponse>): Promise<void> => {
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
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    const activeOrders = await Order.find({
      'orderItems.product': req.params.id,
      status: { $in: ['Pending', 'Approved', 'Shipped'] }
    });

    if (activeOrders.length > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete product with active orders`,
        activeOrdersCount: activeOrders.length,
        canSoftDelete: true,
        suggestion: 'Mark product as unavailable instead'
      });
      return;
    }

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
      error: (error as Error).message,
    });
  }
};

export const softDeleteProduct = async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

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
      error: (error as Error).message,
    });
  }
};
