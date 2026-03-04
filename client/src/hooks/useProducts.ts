import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { Product, PaginatedResponse, ApiResponse } from "../types";

const API_BASE = "/api/products";

export function useProducts(page: number = 1, limit: number = 12) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const response = await api.get(
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
      const response = await api.get(`${API_BASE}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const response = await api.post(API_BASE, productData);
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
      const response = await api.put(`${API_BASE}/${id}`, productData);
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
      await api.delete(`${API_BASE}/${id}`);
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
      const response = await api.patch(
        `${API_BASE}/${id}/soft-delete`,
      );
      return response.data.data;
    },
    onSuccess: (data: Product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data._id] });
    },
  });
}
