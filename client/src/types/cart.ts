// Import types
import type { Product } from './product';

// Cart item interface
export interface CartItem {
  _id: string;
  product: Product | null;
  quantity: number;
}

// Cart state
export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

// Add to cart payload
export interface AddToCartPayload {
  productId: string;
  quantity?: number;
}

// Update cart item payload
export interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
}

// Cart API response
export interface CartResponse {
  success: boolean;
  data: CartItem[];
}
