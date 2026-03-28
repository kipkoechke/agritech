import { Pagination } from "./pagination";

export interface RegionZone {
  id: string;
  name: string;
  region_id: string;
}

export interface RegionMetadata {
  capital?: string;
  headquarter_location?: string;
  established_date?: string;
  coverage_area?: {
    counties?: string[];
    dairy_farms?: string;
    climate?: string;
    population?: string;
  };
}

export interface Region {
  id: string;
  code: string;
  name: string;
  status: boolean;
  metadata: RegionMetadata | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  zones: RegionZone[];
}

export interface RegionsResponse {
  data: Region[];
  pagination: Pagination;
}

export interface RegionDetailResponse {
  data: Region;
  code: number;
  message: string;
  success: boolean;
}

export interface CreateRegionPayload {
  name: string;
}

export interface UpdateRegionPayload {
  name?: string;
  status?: boolean;
}
