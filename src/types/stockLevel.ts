import { Pagination } from "./pagination";

// Stock level item in list response
export interface StockLevelBatch {
  id: string;
  batch_number: string;
}

export interface StockLevelListItem {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  unit_of_measure: string | null;
  active_stock: number;
  expired_stock: number;
  // API sometimes returns batch information for each stock item
  batches?: StockLevelBatch[];
}

// Stock level list response
export interface StockLevelsResponse {
  data: StockLevelListItem[];
  pagination: Pagination;
}

// Stock detail for single stock item
export interface StockDetail {
  id: string;
  quantity: number;
  batch_number: string;
  expiry_date: string;
  manufacture_date?: string;
}

// Product info in stock detail response
export interface StockProductInfo {
  id: string;
  name: string;
  sku: string;
  unit_of_measure: string | null;
}

// Stock summary
export interface StockSummary {
  active_stock: number;
  expired_stock: number;
}

// Stock history item
export interface StockHistoryItem {
  id: string;
  batch_number: string;
  quantity: number;
  manufacture_date: string;
  expiry_date: string;
  received_stock: number;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
}

// Single stock level detail response
export interface StockLevelDetailResponse {
  stock: StockDetail;
  product: StockProductInfo;
  summary: StockSummary;
  history: StockHistoryItem[];
}

// Create stock level payload
export interface CreateStockLevelPayload {
  product_id: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  manufacture_date?: string;
}

// Update stock level payload
export interface UpdateStockLevelPayload {
  batch_number?: string;
  quantity?: number;
  expiry_date?: string;
  manufacture_date?: string;
}
