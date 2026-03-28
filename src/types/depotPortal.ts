// Depot Manager Portal Types

import { Pagination } from "./pagination";

// Common Zone reference
export interface DepotPortalZone {
  id: string;
  name: string;
  code: string;
}

// Sales Person
export interface DepotPortalSalesPerson {
  id: string;
  employee_number: string;
  name: string;
  email: string;
  phone: string;
  zone: DepotPortalZone;
  customers_count: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface DepotPortalSalesPersonsResponse {
  data: DepotPortalSalesPerson[];
  pagination: Pagination;
}

// Customer
export interface DepotPortalCustomerSalesPerson {
  id: string;
  name: string;
  employee_number: string;
}

export interface DepotPortalCustomer {
  id: string;
  name: string;
  account_number: string;
  email: string;
  phone: string;
  zone: DepotPortalZone;
  sales_person: DepotPortalCustomerSalesPerson | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface DepotPortalCustomersResponse {
  data: DepotPortalCustomer[];
  pagination: Pagination;
}

// Order Item
export interface DepotPortalOrderItemProduct {
  id: string;
  name: string;
  sku: string;
}

export interface DepotPortalOrderItem {
  id: string;
  product: DepotPortalOrderItemProduct;
  quantity: number | null;
  unit_price: string;
  total_price: string;
}

export interface DepotPortalOrderCustomer {
  id: string;
  name: string;
  email: string;
}

export interface DepotPortalOrder {
  id: string;
  order_number: string;
  amount: string;
  amount_paid: string;
  balance_remaining: string;
  payment_status: "pending" | "partially_paid" | "paid" | "refunded";
  delivery_status:
    | "pending"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  is_credit_order: boolean;
  customer: DepotPortalOrderCustomer;
  zone: DepotPortalZone;
  items: DepotPortalOrderItem[];
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface DepotPortalOrdersResponse {
  data: DepotPortalOrder[];
  pagination: Pagination;
}

// Payment
export interface DepotPortalPaymentOrder {
  id: string;
  order_number: string;
}

export interface DepotPortalPaymentCustomer {
  id: string;
  name: string;
  email: string;
}

export interface DepotPortalPayment {
  id: string;
  transaction_number: string;
  amount: string;
  payment_method: "mpesa" | "wallet" | "cash" | "bank";
  status: "pending" | "completed" | "failed" | "refunded";
  order: DepotPortalPaymentOrder;
  customer: DepotPortalPaymentCustomer;
  zone: DepotPortalZone;
  created_at: string;
  updated_at: string;
}

export interface DepotPortalPaymentsResponse {
  data: DepotPortalPayment[];
  pagination: Pagination;
}

// Query Params
export interface DepotPortalQueryParams {
  page?: number;
  per_page?: number;
  paginate?: boolean;
  search?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  delivery_status?: string;
  date_from?: string;
  date_to?: string;
}
