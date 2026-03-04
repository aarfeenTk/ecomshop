import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
import { ApiResponse, AuthRequest, Order as OrderType } from '../types';

interface CreateOrderBody {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer';
  transactionReference?: string;
}

interface UpdateOrderStatusBody {
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered';
}

export const createOrder = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      paymentMethod,
      transactionReference,
    } = req.body as CreateOrderBody;

    const user = await User.findById(req.user!.id).populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true }
    });

    if (!user.cart || user.cart.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
      return;
    }

    const availableCartItems = user.cart.filter(
      item => item.product && !item.product.isDeleted && item.product.active
    );

    if (availableCartItems.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No available products in cart',
      });
      return;
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of availableCartItems) {
      const product = item.product;

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
        return;
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user!.id,
      orderItems,
      totalPrice,
      shippingDetails: {
        fullName,
        email,
        phone,
        address,
      },
      paymentMethod,
      transactionReference: paymentMethod === 'Bank Transfer' ? transactionReference : undefined,
    });

    user.cart = user.cart.filter(
      item => item.product && (item.product.isDeleted || !item.product.active)
    );
    await user.save();

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ user: req.user!.id });

    const orders = await Order.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const getOrders = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { status } = req.body as UpdateOrderStatusBody;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};
