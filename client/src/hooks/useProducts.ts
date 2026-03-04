import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Product, PaginatedResponse, ApiResponse } from "../types";

const API_BASE = "/api/products";

export function useProducts(page: number = 1, limit: number = 12) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE}?page=${page}&limit=${limit}`,
      );
      return response.data;
    },
  });
}

export function useProduct(id: string | null) {
  return useQuery<ApiResponse<Product>>({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(API_BASE, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      productData,
    }: {
      id: string;
      productData: Partial<Product>;
    }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_BASE}/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    onSuccess: (data: Product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data._id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    },
    onSuccess: (id: string) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}

export function useSoftDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE}/${id}/soft-delete`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    },
    onSuccess: (data: Product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data._id] });
    },
  });
}
