import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getSalesPersonPortalOrders,
  getSalesPersonPortalOrder,
  createSalesPersonPortalOrder,
  amendSalesPersonPortalOrder,
  createCustomerOrder,
  getSalesPersonPortalCustomers,
  getSalesPersonPortalCustomer,
  getSalesPersonCustomerOrders,
  createSalesPersonPortalCustomer,
  initiateOrderPayment,
  getPaymentStatus,
  getSalesPersonTransactions,
  getSalesPersonTransaction,
  SalesPersonPortalOrdersParams,
  SalesPersonPortalCustomersParams,
  InitiatePaymentPayload,
} from "@/services/salesPersonPortalService";
import type {
  CreateSalesPersonOrderPayload,
  CreateSalesPersonCustomerPayload,
} from "@/types/salesPersonOrder";
import type { AmendOrderPayload } from "@/types/order";
import type { SalesPersonTransactionsParams } from "@/types/salesPersonTransaction";

// ============================================
// SALES PERSON PORTAL - ORDERS HOOKS
// ============================================

// List orders hook with params
export const useSalesPersonPortalOrders = (
  params: SalesPersonPortalOrdersParams = {},
) => {
  return useQuery({
    queryKey: ["sales-person-portal-orders", params],
    queryFn: () => getSalesPersonPortalOrders(params),
  });
};

// Single order hook
export const useSalesPersonPortalOrder = (id: string) => {
  return useQuery({
    queryKey: ["sales-person-portal-order", id],
    queryFn: () => getSalesPersonPortalOrder(id),
    enabled: !!id,
  });
};

// Create order mutation with toast
export const useCreateSalesPersonPortalOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesPersonOrderPayload) =>
      createSalesPersonPortalOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales-person-portal-orders"],
      });
      toast.success("Order created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create order");
    },
  });
};

// Amend order mutation (update item quantities)
export const useAmendSalesPersonPortalOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AmendOrderPayload }) =>
      amendSalesPersonPortalOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sales-person-portal-orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sales-person-portal-order", variables.id],
      });
      toast.success("Order amended successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to amend order");
    },
  });
};

// Create customer order mutation (for customer role - no customer_id needed)
export const useCreateCustomerOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateSalesPersonOrderPayload, "customer_id">) =>
      createCustomerOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["distributor-dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-orders"],
      });
      toast.success("Order placed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to place order");
    },
  });
};

// ============================================
// SALES PERSON PORTAL - CUSTOMERS HOOKS
// ============================================

// List customers hook with params
export const useSalesPersonPortalCustomers = (
  params: SalesPersonPortalCustomersParams = {},
) => {
  const { enabled = true, ...queryParams } = params;
  return useQuery({
    queryKey: ["sales-person-portal-customers", queryParams],
    queryFn: () => getSalesPersonPortalCustomers(queryParams),
    enabled,
  });
};

// Single customer hook
export const useSalesPersonPortalCustomer = (id: string) => {
  return useQuery({
    queryKey: ["sales-person-portal-customer", id],
    queryFn: () => getSalesPersonPortalCustomer(id),
    enabled: !!id,
  });
};

// Customer orders hook
export const useSalesPersonCustomerOrders = (
  customerId: string,
  params: SalesPersonPortalOrdersParams = {},
) => {
  return useQuery({
    queryKey: ["sales-person-customer-orders", customerId, params],
    queryFn: () => getSalesPersonCustomerOrders(customerId, params),
    enabled: !!customerId,
  });
};

// Create customer mutation with toast
export const useCreateSalesPersonPortalCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesPersonCustomerPayload) =>
      createSalesPersonPortalCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales-person-portal-customers"],
      });
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
        // Show first validation error as toast
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

// ============================================
// PAYMENT HOOKS
// ============================================

// Initiate payment mutation
export const useInitiateOrderPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: InitiatePaymentPayload;
    }) => initiateOrderPayment(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales-person-portal-orders"],
      });
      toast.success(
        "Payment initiated successfully. Check your phone for the M-Pesa prompt.",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate payment");
    },
  });
};

// Payment status polling hook
export const usePaymentStatus = (
  orderId: string | null,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: () => getPaymentStatus(orderId!),
    enabled: !!orderId && enabled,
    // Retry silently on errors (transaction may not exist yet)
    retry: 3,
    retryDelay: 2000,
    // Don't throw errors to UI during polling
    throwOnError: false,
    refetchInterval: (query) => {
      // Keep polling if there's an error (transaction might not be created yet)
      if (query.state.error) {
        return 3000;
      }
      // Stop polling when payment is paid, failed, or cancelled
      const status = query.state.data?.data?.payment_status;
      if (status === "paid" || status === "failed" || status === "cancelled") {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    refetchIntervalInBackground: false,
  });
};

// ============================================
// SALES PERSON TRANSACTIONS HOOKS
// ============================================

// List transactions hook with params
export const useSalesPersonTransactions = (
  params: SalesPersonTransactionsParams = {},
) => {
  return useQuery({
    queryKey: ["sales-person-transactions", params],
    queryFn: () => getSalesPersonTransactions(params),
  });
};

// Single transaction hook
export const useSalesPersonTransaction = (id: string) => {
  return useQuery({
    queryKey: ["sales-person-transaction", id],
    queryFn: () => getSalesPersonTransaction(id),
    enabled: !!id,
  });
};
