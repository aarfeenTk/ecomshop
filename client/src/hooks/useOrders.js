import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = '/api/orders';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await axios.post(API_BASE, orderData, getAuthHeaders());
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['myOrders']);
    },
  });
}

export function useMyOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['myOrders', page, limit],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE}/my?page=${page}&limit=${limit}`,
        getAuthHeaders()
      );
      return response.data;
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await axios.get(API_BASE, getAuthHeaders());
      return response.data.data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axios.put(
        `${API_BASE}/${id}/status`,
        { status },
        getAuthHeaders()
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['myOrders']);
    },
  });
}
