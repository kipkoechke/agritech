export interface Cluster {
  id: string;
  name: string;
  code: string;
  coordinates: [number, number] | null;
  zone?: {
    id: string;
    name: string;
  };
  factory?: {
    id: string;
    name: string;
    code: string;
  };
  farms_count: number;
  farm_workers_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClusterData {
  name: string;
  code: string;
  factory_id: string;
  coordinates?: { lat: number; lng: number };
}

export interface UpdateClusterData {
  name?: string;
  code?: string;
  factory_id?: string;
  coordinates?: { lat: number; lng: number };
}

export interface ClusterPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface ClustersResponse {
  data: Cluster[];
  pagination: ClusterPagination;
}

export interface ClusterResponse {
  data: Cluster;
}
