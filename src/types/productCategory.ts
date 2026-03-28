import { Pagination } from "./pagination";

export interface StorageRequirements {
  temperature: string;
  humidity: string;
  shelf_life_days: number;
}

export interface ProductCategoryMetadata {
  storage_requirements?: StorageRequirements;
  typical_products?: string[];
  market_segment?: string;
  quality_standards?: string;
  shelf_life_days?: number;
  storage_temperature?: string;
}

export interface CategoryProduct {
  id: string;
  name: string;
  price: string;
  product_category_id: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  metadata: ProductCategoryMetadata | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products?: CategoryProduct[];
}

export interface CreateProductCategoryPayload {
  name: string;
  description?: string;
  metadata?: {
    shelf_life_days?: number;
    storage_temperature?: string;
  };
}

export interface UpdateProductCategoryPayload {
  name?: string;
  description?: string;
  metadata?: {
    shelf_life_days?: number;
    storage_temperature?: string;
  };
}

export interface ProductCategoriesResponse {
  data: ProductCategory[];
  pagination: Pagination;
}

export interface ProductCategoryDetailResponse {
  data: ProductCategory;
  code: number;
  message: string;
  success: boolean;
}
