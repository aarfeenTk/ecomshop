import { createSlice } from "@reduxjs/toolkit";
import { User, AuthState } from "../../types";

const checkAuth = (): User | null => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    try {
      return JSON.parse(user);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  }
  return null;
};

const persistedUser = checkAuth();

const initialState: AuthState = {
  user: persistedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser: (state, action: { payload: User | null }) => {
      state.user = action.payload;
    },
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
