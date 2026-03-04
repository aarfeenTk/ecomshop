import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import {
  Order,
  CreateOrderData,
  UpdateOrderStatusData,
  ApiResponse,
  PaginatedResponse,
} from "../types";

const API_BASE = "/api/orders";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const response = await api.post(API_BASE, orderData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useMyOrders(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ["myOrders", page, limit],
    queryFn: async () => {
      const response = await api.get(
        `${API_BASE}/my?page=${page}&limit=${limit}`,
      );
      return response.data;
    },
  });
}

export function useOrders() {
  return useQuery<ApiResponse<Order[]>>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get(API_BASE);
      return response.data;
    },
  });
}

export function useOrder(id: string | null) {
  return useQuery<ApiResponse<Order>>({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await api.get(`${API_BASE}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateOrderStatusData) => {
      const response = await api.put(`${API_BASE}/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (data: Order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data._id] });
    },
  });
}
