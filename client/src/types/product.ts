// Product interface
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  isDeleted?: boolean;
  deletedAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Product creation/update payload
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

// Products API response
export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Product[];
}

// Single product API response
export interface ProductResponse {
  success: boolean;
  data: Product;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}
