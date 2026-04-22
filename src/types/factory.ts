export interface Factory {
  id: string;
  name: string;
  code: string;
  coordinates: [number, number] | null;
  zone?: {
    id: string;
    name: string;
  };
  admin?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFactoryData {
  name: string;
  code?: string;
  zone_id: string;
  coordinates?: { lat: number; lng: number };
  user_id?: string;
}

export interface UpdateFactoryData {
  name?: string;
  code?: string;
  zone_id?: string;
  coordinates?: { lat: number; lng: number };
  user_id?: string;
}

export interface FactoryPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface FactoriesResponse {
  data: Factory[];
  pagination: FactoryPagination;
}

export interface FactoryResponse {
  data: Factory;
}
