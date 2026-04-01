// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ProductPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: ProductPagination;
}

export interface ProductResponse {
  data: Product;
}

export interface PriceHistoryResponse {
  data: any[];
}