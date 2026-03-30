// types/product.ts
export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseVolume {
  id: string;
  name: string;
  min_quantity: number;
  max_quantity: number | null;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface PriceReview {
  id: string;
  title: string;
  old_price: number;
  new_price: number;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  production_cost?: number;
  base_price?: number;
  discounted_price?: number;
  unit_of_measure?: string;
  image?: string;
  is_active: boolean;
  category_id?: string;
  category?: Category;
  current_price_review?: PriceReview;
  purchase_volumes?: PurchaseVolume[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  price: number;
  production_cost?: number;
  base_price?: number;
  discounted_price?: number;
  unit_of_measure?: string;
  image?: string;
  is_active?: boolean;
  category_id?: string;
}

export interface UpdateProductData {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  production_cost?: number;
  base_price?: number;
  discounted_price?: number;
  unit_of_measure?: string;
  image?: string;
  is_active?: boolean;
  category_id?: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  price_review: PriceReview;
  created_at: string;
  updated_at?: string;
}

export interface CreatePriceHistoryData {
  product_id: string;
  price: number;
  effective_date?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ProductsResponse extends ApiResponse<Product[]> {}
export interface ProductResponse extends ApiResponse<Product> {}
export interface PriceHistoryResponse extends ApiResponse<PriceHistory[]> {}