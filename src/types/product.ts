import { Pagination } from "./pagination";

export interface ProductCategory {
  id: string;
  name: string;
}

export interface PriceReview {
  id: string;
  title: string;
  effective_date: string;
  old_price: string;
  new_price: string;
}

export interface PurchaseVolume {
  id: string;
  name: string;
  min_quantity: string;
  max_quantity: string | null;
  price: string;
}

export interface ProductMetadata {
  fat_content?: string;
  packaging?: string;
  shelf_life?: string;
  unit_of_measure?: string;
  delivered_on?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  unit_of_measure: string | null;
  sku: string;
  slug: string;
  description: string | null;
  price: string;
  base_price: number;
  discounted_price: string | null;
  production_cost: string;
  is_active: boolean;
  image: string | null;
  metadata: ProductMetadata | ProductMetadata[] | null;
  created_at: string;
  updated_at: string;
  category: ProductCategory;
  current_price_review?: PriceReview;
  purchase_volumes?: PurchaseVolume[];
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  unit_of_measure?: string;
  description?: string;
  price: number;
  product_category_id: string;
  image?: File | string;
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  unit_of_measure?: string;
  description?: string;
  price?: number;
  product_category_id?: string;
  image?: File | string;
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export interface ProductDetailResponse {
  data: Product;
  code?: number;
  message?: string;
  success?: boolean;
}

// Price History
export interface PriceHistoryItem {
  id: string;
  old_price: string;
  new_price: string;
  created_at: string;
  price_review: {
    id: string;
    title: string;
    effective_date: string;
  };
}

export interface PriceHistoryResponse {
  data: PriceHistoryItem[];
  pagination: Pagination;
}
