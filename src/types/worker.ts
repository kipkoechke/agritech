export interface WorkerRef {
  id: string;
  name: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  zone?: WorkerRef;
  factory?: WorkerRef;
  cluster?: WorkerRef;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorkerData {
  name: string;
  phone: string;
  pin: string;
  zone_id?: string;
  factory_id?: string;
  cluster_id?: string;
}

export interface UpdateWorkerData {
  name?: string;
  phone?: string;
  pin?: string;
}

export interface WorkerPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface WorkersResponse {
  data: Worker[];
  pagination: WorkerPagination;
}

export interface WorkerResponse {
  data: Worker;
}
