import Product from '../models/Product';
import Order from '../models/Order';
import { ProductDocument, ApiResponse } from '../types';
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../errors';
import { FilterQuery } from 'mongoose';

/**
 * Product query parameters
 */
export interface ProductQuery {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Product creation data
 */
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

/**
 * Product update data
 */
export interface UpdateProductData extends Partial<CreateProductData> {}

/**
 * Product with order information
 */
export interface ProductWithOrderInfo extends ProductDocument {
  hasActiveOrders: boolean;
  activeOrdersCount: number;
}

/**
 * ProductService - Handles business logic for products
 */
class ProductService {
  /**
   * Get all products with pagination and filtering
   */
  async getProducts(query: ProductQuery) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: FilterQuery<ProductDocument> = { isDeleted: false };

    if (category) {
      filterQuery.category = category;
    }

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filterQuery.price = {};
      if (minPrice !== undefined) filterQuery.price.$gte = minPrice;
      if (maxPrice !== undefined) filterQuery.price.$lte = maxPrice;
    }

    // Get total count
    const total = await Product.countDocuments(filterQuery);

    // Get products
    const products = await Product.find(filterQuery)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get active order counts for each product
    const productsWithOrderInfo = await Promise.all(
      products.map(async (product) => {
        const activeOrdersCount = await Order.countDocuments({
          'orderItems.product': product._id,
          status: { $in: ['Pending', 'Approved', 'Shipped'] },
        });

        return {
          ...product.toObject(),
          hasActiveOrders: activeOrdersCount > 0,
          activeOrdersCount,
        } as ProductWithOrderInfo;
      })
    );

    return {
      products: productsWithOrderInfo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<ProductDocument> {
    const product = await Product.findById(id);

    if (!product || product.isDeleted) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData): Promise<ProductDocument> {
    const product = await Product.create(data);
    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData): Promise<ProductDocument> {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id: string): Promise<ProductDocument> {
    const product = await this.getProductById(id);

    // Check for active orders
    const activeOrders = await Order.find({
      'orderItems.product': id,
      status: { $in: ['Pending', 'Approved', 'Shipped'] },
    });

    if (activeOrders.length > 0) {
      throw new BadRequestError('Cannot delete product with active orders', {
        activeOrdersCount: activeOrders.length,
        canSoftDelete: true,
        suggestion: 'Mark product as unavailable instead',
      });
    }

    // Soft delete
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.active = false;
    product.stock = 0;
    await product.save();

    return product;
  }

  /**
   * Soft delete product
   */
  async softDeleteProduct(id: string): Promise<ProductDocument> {
    const product = await this.getProductById(id);

    product.isDeleted = true;
    product.deletedAt = new Date();
    product.active = false;
    product.stock = 0;
    await product.save();

    return product;
  }

  /**
   * Check if product exists
   */
  async productExists(id: string): Promise<boolean> {
    const product = await Product.findById(id);
    return product !== null && !product.isDeleted;
  }

  /**
   * Update product stock
   */
  async updateProductStock(productId: string, quantity: number): Promise<ProductDocument> {
    const product = await this.getProductById(productId);

    if (product.stock < quantity) {
      throw new BadRequestError(`Insufficient stock for product: ${product.name}`);
    }

    product.stock -= quantity;
    await product.save();

    return product;
  }
}

export default new ProductService();
