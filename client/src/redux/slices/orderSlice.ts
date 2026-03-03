import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Order, OrderFormData, OrdersResponse, PaginationParams } from '../../types';

interface OrderState {
  orders: Order[];
  order: Order | null;
  loading: boolean;
  error: string | null;
  updatingOrderId: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

const initialState: OrderState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  updatingOrderId: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
};

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: OrderFormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as Order;
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async ({ page = 1, limit = 10 }: PaginationParams = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<OrdersResponse>(`/api/orders/my?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as Order[];
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: string; status: Order['status'] }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data as Order;
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action: PayloadAction<OrdersResponse>) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          limit: action.payload.limit || 10,
        };
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      .addCase(getOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.orders = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state, action) => {
        state.updatingOrderId = action.meta.arg.id;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        state.updatingOrderId = null;
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updatingOrderId = null;
        state.error = action.payload as string | null;
      });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;
