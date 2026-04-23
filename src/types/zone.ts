export interface Zone {
  id: string;
  name: string;
  is_active?: boolean;
  factories?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ZonesPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface ZonesResponse {
  data: Zone[];
  pagination: ZonesPagination;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    current_page: number;
    per_page: number;
    first_page: number;
  };
}