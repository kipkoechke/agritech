export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Zone {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Farm {
  id: string;
  name: string;
  size: string;
  coordinates?: Coordinates;
  zone?: Zone;
  zone_id?: string;
  product?: Product;
  product_id?: string;
  owner?: User;
  owner_id?: string;
  supervisor?: User;
  supervisor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFarmData {
  name: string;
  size: number;
  coordinates: Record<string, any>;
  zone_id: string;
  product_id: string;
}

export interface UpdateFarmData {
  name?: string;
  size?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  zone_id?: string;
  product_id?: string;
  owner_id?: string;
  supervisor_id?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    current_page: number;
    per_page: number;
    first_page: number;
  };
}