export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  unit?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  effective_date: string;
  created_at?: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price?: number;
  unit?: string;
  category?: string;
  is_active?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  category?: string;
  is_active?: boolean;
}

export interface CreatePriceHistoryData {
  product_id: string;
  price: number;
  effective_date?: string;
}