// Export all type definitions
export * from './product';
export * from './order';
export * from './auth';
export * from './cart';

// Common API error response
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  activeOrdersCount?: number;
  canSoftDelete?: boolean;
}

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Redux thunk API config
export interface ThunkAPIConfig {
  rejectWithValue: (value: unknown) => unknown;
}
