import User from '../models/User';
import Product from '../models/Product';
import { UserDocument } from '../types';
import {
  NotFoundError,
  BadRequestError,
} from '../errors';

export interface CartItemData {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

class CartService {
  async getCart(userId: string) {
    const user = await User.findById(userId).populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true },
    }) as UserDocument | null;

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.cart || [];
  }

  async addToCart(userId: string, data: CartItemData) {
    const { productId, quantity = 1 } = data;

    if (quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    const user = await User.findById(userId) as UserDocument | null;
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!product.active || product.isDeleted) {
      throw new BadRequestError('Product is not available');
    }

    if (product.stock < quantity) {
      throw new BadRequestError(`Only ${product.stock} items available in stock`);
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.product?.toString() === productId,
    );

    if (existingItemIndex >= 0) {
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
      });
    }

    await user.save();

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, productId: string, data: UpdateCartItemData) {
    const { quantity } = data;

    if (quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    const user = await User.findById(userId) as UserDocument | null;
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product?.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Cart item not found');
    }

    const product = await Product.findById(productId);
    
    if (!product || !product.active || product.isDeleted) {
      throw new BadRequestError('Product is no longer available');
    }

    if (product.stock < quantity) {
      throw new BadRequestError(`Only ${product.stock} items available in stock`);
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string) {
    const user = await User.findById(userId) as UserDocument | null;
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product?.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Cart item not found');
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const user = await User.findById(userId) as UserDocument | null;
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.cart = [];
    await user.save();

    return [];
  }

  async getCartCount(userId: string): Promise<number> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.cart.reduce((total, item) => total + item.quantity, 0);
  }
}

export default new CartService();
