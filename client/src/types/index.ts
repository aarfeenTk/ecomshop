// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  active?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  hasActiveOrders?: boolean;
  activeOrdersCount?: number;
}

export interface ProductState {
  product: Product | null;
  deletingId: string | null;
}

// Cart types
export interface CartItem {
  _id: string;
  product: Product | null;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartState {
  items: CartItem[];
}

// Order types
export type OrderStatus = "Pending" | "Approved" | "Shipped" | "Delivered";
export type PaymentMethod = "Cash on Delivery" | "Bank Transfer";

export interface OrderItem {
  product: Product | null;
  quantity: number;
  price: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  _id: string;
  user?: User;
  orderItems: OrderItem[];
  shippingDetails: ShippingDetails;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderState {
  order: Order | null;
  updatingOrderId: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  total: number;
  page: number;
  pages: number;
  limit?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  data: {
    user: User;
  };
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

// Cart API types
export interface AddToCartData {
  productId: string;
  quantity: number;
  product?: Partial<Product>;
}

export interface UpdateCartItemData {
  productId: string;
  quantity: number;
}

// Order API types
export interface CreateOrderData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
}

export interface UpdateOrderStatusData {
  id: string;
  status: OrderStatus;
}
