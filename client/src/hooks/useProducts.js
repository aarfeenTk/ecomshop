import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = '/api/products';

export function useProducts(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}?page=${page}&limit=${limit}`);
      return response.data;
    },
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_BASE, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productData }) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE}/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', data._id]);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', id]);
    },
  });
}

export function useSoftDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_BASE}/${id}/soft-delete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', data._id]);
    },
  });
}
