import { Pagination } from "./pagination";
import { OrderedItem } from "./order";

// Sales Person Order Types

// Customer reference in order
export interface SalesPersonOrderCustomer {
  id: string;
  name: string;
  phone: string;
}

// Approver reference in order
export interface SalesPersonOrderApprover {
  id: string;
  name: string;
}

// Sales Person Order in list view
export interface SalesPersonOrder {
  id: string;
  order_number: string;
  amount: string;
  amount_paid: string;
  discount: string;
  tax: string;
  payment_status: "pending" | "partially_paid" | "paid" | "refunded";
  delivery_status:
    | "pending"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  created_at: string;
  updated_at: string;
  customer: SalesPersonOrderCustomer;
  approver: SalesPersonOrderApprover;
  transporter: {
    id: string;
    name: string;
  } | null;
  items_count: number;
  orderedItems: OrderedItem[];
}

// Ordered item payload for creating order
export interface OrderedItemPayload {
  product_id: string;
  qty: number;
  unit_price: number;
  metadata?: Record<string, unknown>;
}

// Order metadata
export interface OrderMetadata {
  priority?: "low" | "normal" | "high" | "urgent";
  notes?: string;
  [key: string]: unknown;
}

// Create order payload
export interface CreateSalesPersonOrderPayload {
  customer_id: string;
  transporter_id?: string | null;
  discount?: number;
  ordered_items: OrderedItemPayload[];
  metadata?: OrderMetadata;
}

// Sales Person Orders Response
export interface SalesPersonOrdersResponse {
  data: SalesPersonOrder[];
  pagination: Pagination;
}

// Order item in customer order response
export interface CustomerOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: string;
}

// Customer Order (with items and balance)
export interface CustomerOrder {
  id: string;
  order_number: string;
  amount: string;
  amount_paid: string;
  balance: number;
  discount: string;
  tax: string;
  payment_status: "pending" | "partially_paid" | "paid" | "refunded";
  delivery_status:
    | "pending"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  created_at: string;
  updated_at: string;
  approver: SalesPersonOrderApprover | null;
  transporter: {
    id: string;
    name: string;
  } | null;
  items: CustomerOrderItem[];
  items_count: number;
}

// Customer Orders Summary
export interface CustomerOrdersSummary {
  total_orders: number;
  fully_paid_orders: number;
  partially_paid_orders: number;
  pending_orders: number;
  cancelled_orders: number;
  total_amount: number;
  total_paid: number;
  total_outstanding: number;
}

// Customer Orders Response (with summary)
export interface CustomerOrdersResponse {
  summary: CustomerOrdersSummary;
  data: CustomerOrder[];
  pagination: Pagination;
}

// Sales Person Customer Types

// Customer contacts
export interface SalesPersonCustomerContacts {
  phone: string;
  email?: string;
}

// Customer address
export interface SalesPersonCustomerAddress {
  street?: string;
  city?: string;
  postal_code?: string;
}

// Customer metadata
export interface SalesPersonCustomerMetadata {
  hire_date?: string;
  department?: string;
  [key: string]: unknown;
}

// Create customer payload
export interface CreateSalesPersonCustomerPayload {
  name: string;
  zone_id?: string;
  contacts?: SalesPersonCustomerContacts;
  address?: SalesPersonCustomerAddress;
  metadata?: SalesPersonCustomerMetadata;
}

// Sales Person Customer (simplified version)
export interface SalesPersonCustomer {
  id: string;
  name: string;
  account_number?: string;
  phone?: string;
  zone?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// Sales Person Customers Response
export interface SalesPersonCustomersResponse {
  data: SalesPersonCustomer[];
  pagination: Pagination;
}
