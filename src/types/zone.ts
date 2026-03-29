export interface Zone {
  id: string;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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