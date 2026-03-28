import { Pagination } from "./pagination";

export interface ZoneMetadata {
  subcounty?: string;
  administrative_center?: string;
  coverage_areas?: {
    population?: string;
    dairy_cooperatives?: number;
    elevation?: string;
  };
  farming_characteristics?: {
    main_crops?: string[];
    average_farm_size?: string;
    soil_type?: string;
  };
  description?: string;
}

export interface ZoneRegion {
  id: string;
  name: string;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  status: boolean;
  metadata: ZoneMetadata | null;
  created_at: string;
  updated_at: string;
  region: ZoneRegion | null;
  sales_persons_count?: number;
  customers_count?: number;
}

export interface ZonesResponse {
  data: Zone[];
  pagination: Pagination;
}

export interface CreateZonePayload {
  name: string;
  region_id: string;
}

export interface UpdateZonePayload {
  name?: string;
  region_id?: string;
  status?: boolean;
}
