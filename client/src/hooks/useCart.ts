import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  CartItem,
  AddToCartData,
  UpdateCartItemData,
  ApiResponse,
  Product,
} from "../types";

const API_BASE = "/api/cart";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export function useCart() {
  return useQuery<ApiResponse<CartItem[]>>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await axios.get(API_BASE, getAuthHeaders());
      return response.data;
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: AddToCartData) => {
      const response = await axios.post(API_BASE, itemData, getAuthHeaders());
      return response.data.data;
    },
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(["cart"]) as
        | { success: boolean; data: CartItem[] }
        | undefined;

      // Optimistically update the cart
      if (previousCart && previousCart.data) {
        const cartItems = previousCart.data;
        const existingItemIndex = cartItems.findIndex(
          (item) => item.product?._id === newItem.productId,
        );

        let newCartItems;
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          newCartItems = cartItems.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item,
          );
        } else {
          // Add new item with full product details from context
          newCartItems = [
            ...cartItems,
            {
              _id: Date.now().toString(), // Temporary ID
              product: newItem.product || ({ _id: newItem.productId } as any),
              quantity: newItem.quantity,
            },
          ];
        }

        queryClient.setQueryData(["cart"], {
          ...previousCart,
          data: newCartItems,
        });
      }

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Rollback to previous cart on error
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: UpdateCartItemData) => {
      const response = await axios.put(
        `${API_BASE}/${productId}`,
        { quantity },
        getAuthHeaders(),
      );
      return response.data.data;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]) as
        | { success: boolean; data: CartItem[] }
        | undefined;

      if (previousCart && previousCart.data) {
        const newCartItems = previousCart.data.map((item: CartItem) =>
          item.product?._id === productId ? { ...item, quantity } : item,
        );
        queryClient.setQueryData(["cart"], {
          ...previousCart,
          data: newCartItems,
        });
      }

      return { previousCart };
    },
    onError: (err, { productId, quantity }, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await axios.delete(
        `${API_BASE}/${productId}`,
        getAuthHeaders(),
      );
      return response.data.data;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]) as
        | { success: boolean; data: CartItem[] }
        | undefined;

      if (previousCart && previousCart.data) {
        const newCartItems = previousCart.data.filter(
          (item: CartItem) => item.product?._id !== productId,
        );
        queryClient.setQueryData(["cart"], {
          ...previousCart,
          data: newCartItems,
        });
      }

      return { previousCart };
    },
    onError: (err, productId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
