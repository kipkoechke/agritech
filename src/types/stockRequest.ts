import { Pagination } from "./pagination";

// Batch information for stock requests
export interface StockRequestBatch {
  batch_no: string;
  quantity: number;
}

// Product request information
export interface ProductRequest {
  id?: string; // API includes this in the products array
  product_id: string;
  quantity: number;
  batches?: StockRequestBatch[];
  product?: Product; // API includes the product relationship
}

// Zone information
export interface Zone {
  id: string;
  name: string;
}

// Product information
export interface Product {
  id: string;
  name: string;
  sku: string;
  unit_of_measure: string | null;
}

// User information
export interface User {
  id: string;
  name: string;
  email: string;
}

// Stock transfer information (when request is fulfilled)
export interface StockTransfer {
  id: string;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

// Stock request item (updated to match actual API response)
export interface StockRequestItem {
  id: string;
  request_number?: string;

  // Multiple products (new format from API)
  products?: ProductRequest[];

  // Legacy single product fields (for backward compatibility)
  product_id?: string;
  quantity?: number;

  from_zone_id: string;
  to_zone_id: string;
  total_quantity?: number;
  has_multiple_products?: boolean;
  status: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
  direction?: "incoming" | "outgoing";
  notes: string | null;
  batches: StockRequestBatch[] | null; // Legacy batches for single product
  requested_by: User | string; // Can be either User object or just ID string
  approved_by: User | string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  stock_transfer_id: string | null;
  created_at: string;
  updated_at: string;

  // Relationships (both camelCase and snake_case for compatibility)
  product?: Product; // Legacy single product
  from_zone?: Zone;
  to_zone?: Zone;
  fromZone?: Zone; // Legacy camelCase
  toZone?: Zone; // Legacy camelCase
  requested_by_user?: User;
  requestedBy?: User; // Legacy camelCase
  approved_by_user?: User;
  approvedBy?: User; // Legacy camelCase
  stock_transfer?: StockTransfer;
  stockTransfer?: StockTransfer; // Legacy camelCase
}

// Stock requests list response
export interface StockRequestsResponse {
  data: StockRequestItem[];
  pagination: Pagination;
}

// Create stock request payload (updated to support both single and multiple products)
export interface CreateStockRequestPayload {
  // Legacy single product support
  product_id?: string;
  quantity?: number;
  batches?: StockRequestBatch[];

  // New multiple products support
  products?: ProductRequest[];

  // Common fields
  from_zone_id: string;
  to_zone_id: string;
  notes?: string;
}

// Update stock request payload
export interface UpdateStockRequestPayload {
  // Legacy single product support
  product_id?: string;
  quantity?: number;
  batches?: StockRequestBatch[];

  // New multiple products support
  products?: ProductRequest[];

  // Common fields
  from_zone_id?: string;
  to_zone_id?: string;
  notes?: string;
}

// Approve stock request payload
export interface ApproveStockRequestPayload {
  notes?: string;
}

// Reject stock request payload
export interface RejectStockRequestPayload {
  reason: string;
}

// Stock request filters for UI
export interface StockRequestFilters {
  product_id?: string;
  from_date?: string;
  to_date?: string;
  status?: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
  from_zone_id?: string;
  to_zone_id?: string;
  direction?: "incoming" | "outgoing" | "all";
}

// Stock request status colors and labels
export const STOCK_REQUEST_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    badgeColor: "yellow",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-800",
    badgeColor: "blue",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    badgeColor: "red",
  },
  fulfilled: {
    label: "Fulfilled",
    color: "bg-green-100 text-green-800",
    badgeColor: "green",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800",
    badgeColor: "gray",
  },
} as const;
