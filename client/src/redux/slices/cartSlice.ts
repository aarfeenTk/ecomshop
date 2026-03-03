import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { CartItem, CartState, AddToCartPayload, UpdateCartItemPayload, CartResponse } from '../../types';

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<CartResponse>('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as CartItem[];
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData: AddToCartPayload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/cart', itemData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as CartItem[];
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }: UpdateCartItemPayload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/cart/${productId}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as CartItem[];
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as CartItem[];
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload;
      });
  },
});

export const { clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;
