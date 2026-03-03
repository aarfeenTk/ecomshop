import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async ({ page = 1, limit = 12 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/products?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Add alias for backward compatibility
export const fetchProducts = getProducts;

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/products', productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

/**
 * Delete product with active order validation
 * Backend will check for active orders and return error if found
 */
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      // Return full error response for active orders check
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete product',
        activeOrdersCount: error.response?.data?.activeOrdersCount || 0,
        canSoftDelete: error.response?.data?.canSoftDelete || false,
      });
    }
  }
);

/**
 * Soft delete product (mark as unavailable without deleting)
 * Use this when product has active orders
 */
export const softDeleteProduct = createAsyncThunk(
  'products/softDeleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/products/${id}/soft-delete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    loading: false,
    error: null,
    deletingId: null,
    pagination: {
      page: 1,
      pages: 1,
      total: 0,
      limit: 12,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDeletingState: (state) => {
      state.deletingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          limit: action.payload.limit || 12,
        };
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.pending, (state, action) => {
        state.deletingId = action.meta.arg.id;
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deletingId = null;
        state.loading = false;
        // Soft delete: mark as deleted instead of removing
        const index = state.products.findIndex(p => p._id === action.payload);
        if (index !== -1) {
          state.products[index] = {
            ...state.products[index],
            isDeleted: true,
            active: false,
            stock: 0,
          };
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deletingId = null;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(softDeleteProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearDeletingState } = productSlice.actions;
export default productSlice.reducer;
