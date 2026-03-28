import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getMTCustomers,
  getMTCustomer,
  createMTCustomer,
  updateMTCustomer,
  deleteMTCustomer,
  getMTCustomerPrices,
  setMTCustomerPrices,
  MTCustomersParams,
} from "@/services/mtCustomerService";
import type {
  CreateMTCustomerPayload,
  UpdateMTCustomerPayload,
  SetMTCustomerPricesPayload,
} from "@/types/mtCustomer";

// List hook with params
export const useMTCustomers = (params: MTCustomersParams = {}) => {
  return useQuery({
    queryKey: ["mt-customers", params],
    queryFn: () => getMTCustomers(params),
  });
};

// Prefetch MT customers for pagination
export const usePrefetchMTCustomers = () => {
  const queryClient = useQueryClient();

  return (params: MTCustomersParams) => {
    queryClient.prefetchQuery({
      queryKey: ["mt-customers", params],
      queryFn: () => getMTCustomers(params),
    });
  };
};

// Single item hook
export const useMTCustomer = (id: string) => {
  return useQuery({
    queryKey: ["mt-customer", id],
    queryFn: () => getMTCustomer(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateMTCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMTCustomerPayload) => createMTCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mt-customers"] });
      toast.success("MT customer created successfully");
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
          axiosError.response?.data?.message || "Failed to create MT customer",
        );
      }
    },
  });
};

// Update mutation with toast
export const useUpdateMTCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMTCustomerPayload;
    }) => updateMTCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mt-customers"] });
      queryClient.invalidateQueries({
        queryKey: ["mt-customer", variables.id],
      });
      toast.success("MT customer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update MT customer");
    },
  });
};

// Delete mutation with toast
export const useDeleteMTCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMTCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mt-customers"] });
      toast.success("MT customer deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete MT customer");
    },
  });
};

// GET MT customer product prices
export const useMTCustomerPrices = (customerId: string) => {
  return useQuery({
    queryKey: ["mt-customer-prices", customerId],
    queryFn: () => getMTCustomerPrices(customerId),
    enabled: !!customerId,
  });
};

// SET MT customer product prices
export const useSetMTCustomerPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: SetMTCustomerPricesPayload;
    }) => setMTCustomerPrices(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["mt-customer-prices", variables.customerId],
      });
      toast.success("Product prices updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product prices");
    },
  });
};
