import { createSlice } from '@reduxjs/toolkit';

const checkAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    try {
      return JSON.parse(user);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

const persistedUser = checkAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedUser,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
