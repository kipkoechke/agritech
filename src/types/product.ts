// types/product.ts
export interface Product {
  id: string;
  name: string;
  description?: string | null;
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

// API Response Types
export interface ProductsResponse {
  data: Product[];
  pagination?: {
    current_page: number;
    per_page: number;
    first_page: number;
    last_page?: number;
    total?: number;
  };
}

export interface ProductResponse {
  data: Product;
}