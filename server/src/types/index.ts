import { Document, Types } from 'mongoose';
import { Request } from 'express';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
  cart: any[];
  createdAt: Date;
  updatedAt: Date;
  getSignedJwtToken(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface ProductDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  active: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | any;
  orderItems: any[];
  shippingDetails: ShippingDetails;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer';
  transactionReference?: string;
  totalPrice: number;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered';
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  product: Types.ObjectId | any;
  quantity: number;
  price: number;
}

export interface JwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export type AuthRequest = AuthenticatedRequest;

export type Product = ProductDocument;
export type Order = OrderDocument;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  error?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
  activeOrdersCount?: number;
  canSoftDelete?: boolean;
  suggestion?: string;
}
