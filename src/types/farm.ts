export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FarmRef {
  id: string;
  name: string;
  code?: string;
}

export interface ActivityScheduleRef {
  id: string;
  reference_code: string;
  activity: { id: string; name: string };
  farm: { id: string; name: string; zone?: FarmRef };
  created_by: { id: string; name: string };
  scheduled_date: string;
  status: string;
  notes: string | null;
  bookings_count: number;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  name: string;
  farm_code: string;
  size: string;
  coordinates?: Coordinates;
  zone?: FarmRef;
  factory?: FarmRef & { code: string };
  cluster?: FarmRef & { code: string };
  product?: FarmRef;
  farmer?: FarmRef;
  supervisor?: FarmRef;
  activity_schedules?: { data: ActivityScheduleRef[] };
  created_at: string;
  updated_at: string;
}

export interface CreateFarmData {
  name: string;
  size: number;
  coordinates: { lat: number; lng: number };
  zone_id: string;
  product_id: string;
  owner_id?: string;
}

export interface UpdateFarmData {
  name?: string;
  size?: number;
  coordinates?: { lat: number; lng: number };
  zone_id?: string;
  product_id?: string;
  owner_id?: string;
  supervisor_id?: string;
}

export interface FarmPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface FarmsResponse {
  data: Farm[];
  pagination: FarmPagination;
}

export interface FarmResponse {
  data: Farm;
}
