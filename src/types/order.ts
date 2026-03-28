// Order Types for Ravine Dairies

// Named reference for nested objects
export interface NamedReference {
  id: string;
  name: string;
}

// Customer with contacts for order details
export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  account_number: string;
  contacts: {
    phone: string;
    email: string;
  };
  accountAdmin?: {
    id: string;
    name: string;
    email: string;
  };
}

// Approver/Sales rep info
export interface OrderApprover {
  id: string;
  name: string;
  email?: string;
}

// Transporter info
export interface OrderTransporter {
  id: string | null;
  name: string | null;
  contacts: string | null;
}

// Order item in list view
export interface OrderListItem {
  id: string;
  order_number: string;
  subtotal: number;
  tax: string;
  discount: string;
  amount: string;
  amount_paid: string;
  balance_remaining: number;
  payment_status: "pending" | "partial" | "paid" | "refunded";
  delivery_status:
    | "pending"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  created_at: string;
  customer: NamedReference;
  approver: NamedReference;
  items_count: number;
}

// Ordered item in detail view
export interface OrderedItem {
  ordered_item_id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: string;
  metadata: string;
}

// Full order details
export interface Order {
  order_id: string;
  order_number: string;
  subtotal: number;
  tax: string;
  discount: string;
  amount: string;
  amount_paid: string;
  balance_remaining: number;
  payment_status: "pending" | "partial" | "paid" | "refunded";
  delivery_status:
    | "pending"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  metadata: string;
  created_at: string;
  updated_at: string;
  customer: OrderCustomer;
  approver: OrderApprover;
  transporter: OrderTransporter;
  orderedItems: OrderedItem[];
}

// Order detail response
export interface OrderDetailResponse {
  message: string;
  data: Order;
}

// Orders list response
export interface OrdersResponse {
  data: OrderListItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// Order transaction
export interface OrderTransaction {
  id: string;
  status: "pending" | "completed" | "failed" | "refunded";
  transaction_number: string;
  amount: string;
  payment_method: "mpesa" | "wallet" | "bank" | "cash";
  phone_number: string | null;
  initiated_at: string;
  mpesa_receipt: string | null;
  paid_at: string | null;
}

// Order transactions response
export interface OrderTransactionsResponse {
  data: {
    order_id: string;
    order_number: string;
    transactions: OrderTransaction[];
  };
}

// Create order item payload
export interface CreateOrderItemPayload {
  product_id: string;
  qty: number;
  unit_price: number;
  metadata?: Record<string, any>;
}

// Create order payload
export interface CreateOrderPayload {
  customer_id: string;
  transporter_id?: string;
  discount?: number;
  ordered_items: CreateOrderItemPayload[];
  metadata?: {
    priority?: "low" | "normal" | "high" | "urgent";
    notes?: string;
    delivery_address?: string;
    delivery_notes?: string;
  };
}

// Update order payload
export interface UpdateOrderPayload {
  transporter_id?: string;
  discount?: number;
  delivery_status?:
    | "pending"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  metadata?: Record<string, any>;
}

// Amend order items payload (update quantities)
export interface AmendOrderItemPayload {
  ordered_item_id: string;
  qty: number;
}

export interface AmendOrderPayload {
  ordered_items: AmendOrderItemPayload[];
}

// Query params for orders endpoint
export interface OrdersQueryParams {
  page?: number;
  per_page?: number;
  paginate?: boolean;
  search?: string;
  zone_id?: string;
  customer_id?: string;
  sales_person_id?: string;
  payment_status?: string;
  delivery_status?: string;
  date_from?: string;
  date_to?: string;
}
