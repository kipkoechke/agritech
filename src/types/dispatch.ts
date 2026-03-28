// Dispatch types for Ravine Dairies

// Named reference for nested objects
export interface DispatchReference {
  id: string;
  name: string;
}

// Transporter reference in dispatch
export interface DispatchTransporter {
  id: string;
  name: string;
  license_plate: string | null;
}

// Zone reference with code
export interface DispatchZone {
  id: string;
  name: string;
  code: string;
}

// Customer reference in dispatch order
export interface DispatchCustomer {
  id: string;
  name: string;
  email: string;
}

// Order within a dispatch
export interface DispatchOrder {
  id: string;
  order_number: string;
  amount: string;
  payment_status: string;
  delivery_status: string;
  order_comment: string | null;
  customer: DispatchCustomer;
}

// Dispatch metadata
export interface DispatchMetadata {
  [key: string]: string | undefined;
}

// Dispatch entity
export interface Dispatch {
  id: string;
  dispatch_number: string;
  comment: string | null;
  status: string;
  transporter: DispatchTransporter | null;
  dispatched_by: DispatchReference;
  zone: DispatchZone;
  orders: DispatchOrder[];
  orders_count: number;
  total_amount: string;
  metadata: DispatchMetadata | null;
  created_at: string;
  updated_at: string;
}

// Paginated dispatches response
export interface DispatchesResponse {
  data: Dispatch[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// Order item in create payload
export interface CreateDispatchOrderItem {
  order_id: string;
  comment?: string;
}

// Create dispatch payload
export interface CreateDispatchPayload {
  orders: CreateDispatchOrderItem[];
  comment?: string;
  transporter_id: string;
}

// Query params for dispatches endpoint
export interface DispatchesQueryParams {
  page?: number;
  per_page?: number;
  paginate?: boolean;
  status?: string;
  search?: string;
  zone_id?: string;
  date_from?: string;
  date_to?: string;
}
