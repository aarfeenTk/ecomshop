import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
import { OrderDocument, UserDocument } from '../types';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors';
import { FilterQuery, Types } from 'mongoose';

/**
 * Order creation data
 */
export interface CreateOrderData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer';
  transactionReference?: string;
}

/**
 * Order status update data
 */
export interface UpdateOrderStatusData {
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered';
}

/**
 * Order query parameters
 */
export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}

/**
 * OrderService - Handles business logic for orders
 */
class OrderService {
  /**
   * Create new order
   */
  async createOrder(userId: string, data: CreateOrderData): Promise<OrderDocument> {
    // Get user with cart
    const user = await User.findById(userId).populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true },
    }) as UserDocument | null;

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if cart is empty
    if (!user.cart || user.cart.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Filter out deleted or inactive products
    const availableCartItems = user.cart.filter(
      (item) => item.product && !item.product.isDeleted && item.product.active,
    );

    if (availableCartItems.length === 0) {
      throw new BadRequestError('No available products in cart');
    }

    // Validate stock and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of availableCartItems) {
      const product = item.product!;

      if (product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: userId,
      orderItems,
      totalPrice,
      shippingDetails: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
      paymentMethod: data.paymentMethod,
      transactionReference: data.paymentMethod === 'Bank Transfer' ? data.transactionReference : undefined,
    });

    // Clear cart (keep only unavailable items)
    user.cart = user.cart.filter(
      (item) => item.product && (item.product.isDeleted || !item.product.active),
    );
    await user.save();

    return order;
  }

  /**
   * Get orders for current user with pagination
   */
  async getMyOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const filterQuery: FilterQuery<OrderDocument> = { user: new Types.ObjectId(userId) };

    const total = await Order.countDocuments(filterQuery);

    const orders = await Order.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;

    const filterQuery: FilterQuery<OrderDocument> = {};
    
    if (status) {
      filterQuery.status = status;
    }

    const total = await Order.countDocuments(filterQuery);

    const orders = await Order.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId?: string, isAdmin: boolean = false): Promise<OrderDocument> {
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check authorization
    if (!isAdmin && order.user._id.toString() !== userId) {
      throw new ForbiddenError('Not authorized to access this order');
    }

    return order;
  }

  /**
   * Update order status (admin)
   */
  async updateOrderStatus(orderId: string, status: UpdateOrderStatusData['status']): Promise<OrderDocument> {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true },
    ).populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * Cancel order (user can cancel pending orders)
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderDocument> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user owns the order
    if (order.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to cancel this order');
    }

    // Only pending orders can be cancelled
    if (order.status !== 'Pending') {
      throw new BadRequestError('Only pending orders can be cancelled');
    }

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = 'Delivered'; // Or add a 'Cancelled' status
    await order.save();

    return order;
  }
}

export default new OrderService();
