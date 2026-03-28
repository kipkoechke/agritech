import axiosInstance from "@/lib/axios";
import type {
  SalesPersonOrder,
  SalesPersonOrdersResponse,
  CreateSalesPersonOrderPayload,
  SalesPersonCustomer,
  SalesPersonCustomersResponse,
  CreateSalesPersonCustomerPayload,
  CustomerOrdersResponse,
} from "@/types/salesPersonOrder";
import type { AmendOrderPayload } from "@/types/order";

// ============================================
// SALES PERSON PORTAL - ORDERS
// ============================================

export interface SalesPersonPortalOrdersParams {
  page?: number;
  per_page?: number;
  paginate?: boolean;
  search?: string;
  payment_status?: string;
  delivery_status?: string;
}

// GET all sales person portal orders (with pagination & filters)
export const getSalesPersonPortalOrders = async (
  params: SalesPersonPortalOrdersParams = {},
): Promise<SalesPersonOrdersResponse> => {
  const response = await axiosInstance.get("/sales-persons/orders", { params });
  return response.data;
};

// GET single sales person portal order by ID
export const getSalesPersonPortalOrder = async (
  id: string,
): Promise<SalesPersonOrder> => {
  const response = await axiosInstance.get(`/sales-persons/orders/${id}`);
  return response.data.data || response.data;
};

// POST create sales person portal order
export const createSalesPersonPortalOrder = async (
  data: CreateSalesPersonOrderPayload,
): Promise<SalesPersonOrder> => {
  const response = await axiosInstance.post("/sales-persons/orders", data);
  return response.data.data || response.data;
};

// PATCH amend sales person portal order (update item quantities)
export const amendSalesPersonPortalOrder = async (
  id: string,
  data: AmendOrderPayload,
): Promise<SalesPersonOrder> => {
  const response = await axiosInstance.patch(
    `/sales-persons/orders/${id}`,
    data,
  );
  return response.data.data || response.data;
};

// POST create customer order (for customer role)
export const createCustomerOrder = async (
  data: Omit<CreateSalesPersonOrderPayload, "customer_id">,
): Promise<SalesPersonOrder> => {
  const response = await axiosInstance.post("/orders", data);
  return response.data.data || response.data;
};

// ============================================
// SALES PERSON PORTAL - CUSTOMERS
// ============================================

export interface SalesPersonPortalCustomersParams {
  page?: number;
  per_page?: number;
  search?: string;
  zone_id?: string;
  enabled?: boolean; // For React Query enabled option
}

// GET all sales person portal customers (with pagination & filters)
export const getSalesPersonPortalCustomers = async (
  params: SalesPersonPortalCustomersParams = {},
): Promise<SalesPersonCustomersResponse> => {
  const response = await axiosInstance.get("/sales-persons/customers/list", {
    params,
  });
  return response.data;
};

// GET customer orders (with summary)
export const getSalesPersonCustomerOrders = async (
  customerId: string,
  params: SalesPersonPortalOrdersParams = {},
): Promise<CustomerOrdersResponse> => {
  const response = await axiosInstance.get(
    `/sales-persons/customers/${customerId}/orders`,
    { params },
  );
  return response.data;
};

// GET single sales person portal customer by ID
export const getSalesPersonPortalCustomer = async (
  id: string,
): Promise<SalesPersonCustomer> => {
  const response = await axiosInstance.get(`/sales-persons/customers/${id}`);
  return response.data.data || response.data;
};

// POST create sales person portal customer
export const createSalesPersonPortalCustomer = async (
  data: CreateSalesPersonCustomerPayload,
): Promise<SalesPersonCustomer> => {
  const response = await axiosInstance.post("/sales-persons/customers", data);
  return response.data.data || response.data;
};

// ============================================
// PAYMENTS
// ============================================

export interface InitiatePaymentPayload {
  phone_number: string;
  amount: number;
}

export interface InitiatePaymentResponse {
  message: string;
  checkout_request_id?: string;
}

// POST initiate M-Pesa payment for an order
export const initiateOrderPayment = async (
  orderId: string,
  data: InitiatePaymentPayload,
): Promise<InitiatePaymentResponse> => {
  const response = await axiosInstance.post(
    `/payments/orders/${orderId}/initiate`,
    data,
  );
  return response.data.data || response.data;
};

// Payment status response
export interface PaymentStatusData {
  order_number: string;
  amount: string;
  transaction_id: string;
  transaction_number: string;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "cancelled";
  initiated_at: string;
  updated_at: string;
  phone_number?: string;
  checkout_request_id?: string;
  failure_reason?: string;
  result_code?: number;
  can_retry?: boolean;
  receipt_number?: string;
}

export interface PaymentStatusResponse {
  message: string;
  data: PaymentStatusData;
}

// GET payment status by order ID
export const getPaymentStatus = async (
  orderId: string,
): Promise<PaymentStatusResponse> => {
  const response = await axiosInstance.get(
    `/payments/orders/${orderId}/payment-status`,
  );
  return response.data;
};

// ============================================
// SALES PERSON PORTAL - TRANSACTIONS
// ============================================

import type {
  SalesPersonTransactionsResponse,
  SalesPersonTransactionsParams,
  SalesPersonTransaction,
} from "@/types/salesPersonTransaction";

// GET all sales person transactions (with pagination & filters)
export const getSalesPersonTransactions = async (
  params: SalesPersonTransactionsParams = {},
): Promise<SalesPersonTransactionsResponse> => {
  const response = await axiosInstance.get("/sales-persons/transactions", {
    params,
  });
  return response.data;
};

// GET single sales person transaction by ID
export const getSalesPersonTransaction = async (
  id: string,
): Promise<SalesPersonTransaction> => {
  const response = await axiosInstance.get(`/sales-persons/transactions/${id}`);
  return response.data.data || response.data;
};
