// Order item interface
export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
}

// Shipping details interface
export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// Order interface
export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  totalPrice: number;
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  transactionReference?: string;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered';
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Import Product type
import type { Product } from './product';

// Orders API response
export interface OrdersResponse {
  success: boolean;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  data: Order[];
}

// Single order API response
export interface OrderResponse {
  success: boolean;
  data: Order;
}

// Order creation payload
export interface OrderFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer';
  transactionReference?: string;
}
