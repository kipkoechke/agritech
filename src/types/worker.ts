export interface Worker {
  id: string;
  name: string;
  phone: string;
  pin: string;
  zone_id: string;
  zone?: {
    id: string;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorkerData {
  name: string;
  phone: string;
  pin: string;
  zone_id: string;
}

export interface UpdateWorkerData {
  name?: string;
  phone?: string;
  pin?: string;
  zone_id?: string;
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