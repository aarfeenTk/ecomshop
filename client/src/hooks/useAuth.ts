import { useMutation } from "@tanstack/react-query";
import api, { setTokens, setUser, clearTokens } from "../utils/api";
import { LoginCredentials, RegisterData, AuthResponse, User } from "../types";

export function useLogin() {
  return useMutation<
    User,
    { response?: { data?: { message?: string } } },
    LoginCredentials
  >({
    mutationFn: async (credentials) => {
      const response = await api.post<AuthResponse>(
        "/api/auth/login",
        credentials,
      );
      const { accessToken, refreshToken, data } = response.data;
      setTokens(accessToken, refreshToken);
      setUser(data.user);
      return data.user;
    },
  });
}

export function useRegister() {
  return useMutation<
    User,
    { response?: { data?: { message?: string } } },
    RegisterData
  >({
    mutationFn: async (userData) => {
      const response = await api.post<AuthResponse>(
        "/api/auth/register",
        userData,
      );
      const { accessToken, refreshToken, data } = response.data;
      setTokens(accessToken, refreshToken);
      setUser(data.user);
      return data.user;
    },
  });
}

export function useLogout() {
  return useMutation<void, unknown, { refreshToken?: string }>({
    mutationFn: async ({ refreshToken }) => {
      if (refreshToken) {
        await api.post("/api/auth/logout", { refreshToken });
      }
      clearTokens();
    },
  });
}

export function useLogoutAll() {
  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      await api.post("/api/auth/logout-all");
      clearTokens();
    },
  });
}
