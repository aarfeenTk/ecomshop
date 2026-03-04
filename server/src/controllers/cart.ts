import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import { ApiResponse, UserDocument } from '../types';

interface CartItemBody {
  productId: string;
  quantity?: number;
}

interface UpdateCartItemBody {
  quantity: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export const getCart = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true }
    }) as UserDocument | null;

    res.status(200).json({
      success: true,
      data: user?.cart || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body as CartItemBody;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
      return;
    }

    const user = await User.findById(req.user!.id) as UserDocument | null;

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const existingItem = user.cart.find(
      (item: any) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock',
        });
        return;
      }
      existingItem.quantity = newQuantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    await user.populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true }
    });

    res.status(200).json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { quantity } = req.body as UpdateCartItemBody;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
      return;
    }

    const user = await User.findById(req.user!.id) as UserDocument | null;

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const itemIndex = user.cart.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
      return;
    }

    user.cart[itemIndex].quantity = quantity;

    await user.save();

    await user.populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true }
    });

    res.status(200).json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const productId = req.params.productId;

    const user = await User.findById(req.user!.id) as UserDocument | null;

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.cart = user.cart.filter(
      (item: any) => item.product.toString() !== productId
    );

    await user.save();

    await user.populate({
      path: 'cart.product',
      model: 'Product',
      options: { includeDeleted: true }
    });

    res.status(200).json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};
