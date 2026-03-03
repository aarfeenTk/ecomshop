import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User, LoginCredentials, RegisterData, AuthState } from '../../types';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const checkAuth = (): User | null => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    try {
      return JSON.parse(user) as User;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

const persistedUser = checkAuth();
const initialStateWithPersist: AuthState = {
  ...initialState,
  user: persistedUser,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user as User;
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user as User;
    } catch (error) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: initialStateWithPersist,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
