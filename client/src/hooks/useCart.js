import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = '/api/cart';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await axios.get(API_BASE, getAuthHeaders());
      return response.data.data;
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData) => {
      const response = await axios.post(API_BASE, itemData, getAuthHeaders());
      return response.data.data;
    },
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update the cart
      if (previousCart) {
        const existingItemIndex = previousCart.findIndex(
          item => item.product._id === newItem.productId
        );

        let newCart;
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          newCart = previousCart.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          // Add new item with full product details from context
          newCart = [
            ...previousCart,
            {
              product: newItem.product || { _id: newItem.productId },
              quantity: newItem.quantity
            }
          ];
        }

        queryClient.setQueryData(['cart'], newCart);
      }

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Rollback to previous cart on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await axios.put(
        `${API_BASE}/${productId}`,
        { quantity },
        getAuthHeaders()
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await axios.delete(
        `${API_BASE}/${productId}`,
        getAuthHeaders()
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });
}
