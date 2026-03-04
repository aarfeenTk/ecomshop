import { createSlice } from "@reduxjs/toolkit";
import { User, AuthState } from "../../types";
import { getAccessToken, getUser as getStoredUser, setUser as setStoredUser, clearTokens, setTokens } from "../../utils/api";

const checkAuth = (): User | null => {
  const token = getAccessToken();
  const user = getStoredUser();
  if (token && user) {
    return user as User;
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
      clearTokens();
    },
    setUser: (state, action: { payload: User | null }) => {
      state.user = action.payload;
      if (action.payload) {
        setStoredUser(action.payload);
      } else {
        localStorage.removeItem("user");
      }
    },
    setAuthTokens: (state, action: { payload: { accessToken: string; refreshToken: string } }) => {
      setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
  },
});

export const { logout, setUser, setAuthTokens } = authSlice.actions;
export default authSlice.reducer;
