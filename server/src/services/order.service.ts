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

export interface CreateOrderData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer';
  transactionReference?: string;
}

export interface UpdateOrderStatusData {
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered';
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}

class OrderService {
  async createOrder(userId: string, data: CreateOrderData): Promise<OrderDocument> {
    const user = await User.findById(userId).populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true },
    }) as UserDocument | null;

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.cart || user.cart.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    const availableCartItems = user.cart.filter(
      (item) => item.product && !item.product.isDeleted && item.product.active,
    );

    if (availableCartItems.length === 0) {
      throw new BadRequestError('No available products in cart');
    }

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

      product.stock -= item.quantity;
      await product.save();
    }

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

    user.cart = user.cart.filter(
      (item) => item.product && (item.product.isDeleted || !item.product.active),
    );
    await user.save();

    return order;
  }

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

  async getOrderById(orderId: string, userId?: string, isAdmin: boolean = false): Promise<OrderDocument> {
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!isAdmin && order.user._id.toString() !== userId) {
      throw new ForbiddenError('Not authorized to access this order');
    }

    return order;
  }

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

  async cancelOrder(orderId: string, userId: string): Promise<OrderDocument> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to cancel this order');
    }

    if (order.status !== 'Pending') {
      throw new BadRequestError('Only pending orders can be cancelled');
    }

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = 'Delivered';
    await order.save();

    return order;
  }
}

export default new OrderService();
