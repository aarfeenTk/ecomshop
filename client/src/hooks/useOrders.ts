import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Order,
  CreateOrderData,
  UpdateOrderStatusData,
  ApiResponse,
  PaginatedResponse,
} from "../types";

const API_BASE = "/api/orders";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const response = await axios.post(API_BASE, orderData, getAuthHeaders());
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
      const response = await axios.get(
        `${API_BASE}/my?page=${page}&limit=${limit}`,
        getAuthHeaders(),
      );
      return response.data;
    },
  });
}

export function useOrders() {
  return useQuery<ApiResponse<Order[]>>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await axios.get(API_BASE, getAuthHeaders());
      return response.data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateOrderStatusData) => {
      const response = await axios.put(
        `${API_BASE}/${id}/status`,
        { status },
        getAuthHeaders(),
      );
      return response.data.data;
    },
    onSuccess: (data: Order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}
