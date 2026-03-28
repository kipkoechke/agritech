// Price Review Types for Ravine Dairies

// Named reference for nested objects
export interface NamedReference {
  id: string;
  name: string;
}

// Product reference in price list
export interface PriceListProduct {
  id: string;
  name: string;
  sku: string;
}

// Price list item
export interface PriceListItem {
  id: string;
  price_review_id: string;
  product_id: string;
  old_price: string;
  new_price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: PriceListProduct;
}

// Purchase volume item
export interface PurchaseVolume {
  id: string;
  name: string;
  price_review_id: string;
  product_id: string;
  min_quantity: string;
  max_quantity: string | null;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: PriceListProduct;
}

// Price review meta info
export interface PriceReviewMeta {
  reason?: string;
  percentage?: number;
}

// Price review status
export type PriceReviewStatus = "draft" | "pending" | "approved" | "rejected";

// Price review list item
export interface PriceReviewListItem {
  id: string;
  title: string;
  effective_date: string;
  description: string;
  status?: PriceReviewStatus | boolean;
  send_notification: boolean;
  reviewed_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  approval_requested_at: string | null;
  meta: PriceReviewMeta;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  reviewer: NamedReference | null;
  approver: NamedReference | null;
}

// Full price review details
export interface PriceReview extends PriceReviewListItem {
  price_lists: PriceListItem[];
  purchase_volumes: PurchaseVolume[];
}

// Price reviews list response
export interface PriceReviewsResponse {
  data: PriceReviewListItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// Create price review payload
export interface CreatePriceReviewPayload {
  title: string;
  effective_date: string;
  description?: string;
  send_notification?: boolean;
  approved_by?: string;
  meta?: PriceReviewMeta;
}

// Update price review payload
export interface UpdatePriceReviewPayload {
  title?: string;
  effective_date?: string;
  description?: string;
  send_notification?: boolean;
  approved_by?: string;
  meta?: PriceReviewMeta;
}

// Purchase volume payload for adding products
export interface PurchaseVolumePayload {
  name: string;
  min_quantity: number;
  max_quantity: number | null;
  price: number;
}

// Product payload for adding to price review
export interface AddProductPayload {
  product_id: string;
  old_price: number;
  new_price: number;
  purchase_volumes?: PurchaseVolumePayload[];
}

// Add products to price review payload
export interface AddProductsToPriceReviewPayload {
  products: AddProductPayload[];
}

// Query params for price reviews endpoint
export interface PriceReviewsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}
