// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  isAdmin?: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Auth response
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
