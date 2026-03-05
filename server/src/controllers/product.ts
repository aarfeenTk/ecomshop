import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import productService, { ProductWithOrderInfo, CreateProductData, UpdateProductData } from '../services/product.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccessResponse, sendPaginatedResponse, sendCreatedResponse } from '../utils/response';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as any;
  
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 12;
  const category = query.category as string;
  const search = query.search as string;
  const minPrice = query.minPrice ? parseFloat(query.minPrice as string) : undefined;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice as string) : undefined;
  const sortBy = query.sortBy as string;
  const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

  const result = await productService.getProducts({
    page,
    limit,
    category,
    search,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
  });

  sendPaginatedResponse(
    res,
    result.products,
    result.pagination.total,
    result.pagination.page,
    result.pagination.limit,
    'Products retrieved successfully'
  );
});

export const getProduct = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const product = await productService.getProductById(req.params.id);

  sendSuccessResponse(
    res,
    product,
    'Product retrieved successfully',
    StatusCodes.OK
  );
});

export const createProduct = asyncHandler(async (req: Request<{}, {}, CreateProductData>, res: Response) => {
  const product = await productService.createProduct(req.body);

  sendCreatedResponse(res, product, 'Product created successfully');
});

export const updateProduct = asyncHandler(async (req: Request<{ id: string }, {}, UpdateProductData>, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  sendSuccessResponse(
    res,
    product,
    'Product updated successfully',
    StatusCodes.OK
  );
});

export const deleteProduct = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const product = await productService.deleteProduct(req.params.id);

  sendSuccessResponse(
    res,
    product,
    'Product marked as unavailable (soft deleted)',
    StatusCodes.OK
  );
});

export const softDeleteProduct = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const product = await productService.softDeleteProduct(req.params.id);

  sendSuccessResponse(
    res,
    product,
    'Product marked as unavailable',
    StatusCodes.OK
  );
});
