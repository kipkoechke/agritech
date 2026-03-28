import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  CustomersParams,
} from "@/services/customerService";
import type {
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/types/customer";

// List hook with params
export const useCustomers = (params: CustomersParams = {}) => {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
  });
};

// Prefetch customers for pagination
export const usePrefetchCustomers = () => {
  const queryClient = useQueryClient();

  return (params: CustomersParams) => {
    queryClient.prefetchQuery({
      queryKey: ["customers", params],
      queryFn: () => getCustomers(params),
    });
  };
};

// Single item hook
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerPayload) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully");
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const apiErrors = axiosError.response?.data?.errors;
      if (apiErrors) {
        const firstError = Object.values(apiErrors)[0]?.[0];
        toast.error(firstError || "Validation error");
      } else {
        toast.error(
          axiosError.response?.data?.message || "Failed to create customer",
        );
      }
    },
  });
};

// Update mutation with toast
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayload }) =>
      updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
      toast.success("Customer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });
};

// Delete mutation with toast
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });
};
