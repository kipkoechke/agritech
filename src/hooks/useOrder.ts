import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getOrders,
  getOrder,
  getOrderTransactions,
  createOrder,
  updateOrder,
  deleteOrder,
} from "@/services/orderService";
import type {
  CreateOrderPayload,
  UpdateOrderPayload,
  OrdersQueryParams,
} from "@/types/order";

// List hook with params
export const useOrders = (params: OrdersQueryParams = {}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params),
  });
};

// Prefetch orders for pagination
export const usePrefetchOrders = () => {
  const queryClient = useQueryClient();

  return (params: OrdersQueryParams) => {
    queryClient.prefetchQuery({
      queryKey: ["orders", params],
      queryFn: () => getOrders(params),
    });
  };
};

// Single item hook
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
};

// Order transactions hook
export const useOrderTransactions = (id: string) => {
  return useQuery({
    queryKey: ["order-transactions", id],
    queryFn: () => getOrderTransactions(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderPayload) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create order"));
    },
  });
};

// Update mutation with toast
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderPayload }) =>
      updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      toast.success("Order updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update order"));
    },
  });
};

// Delete mutation with toast
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; cancellation_message: string }) =>
      deleteOrder(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });
};
