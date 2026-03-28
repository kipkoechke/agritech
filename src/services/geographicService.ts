import { Pagination } from "@/types/pagination";
import axiosInstance from "../lib/axios";

// Types
export interface Level {
  value: string;
  label: string;
}

export interface Role {
  id: string;
  name: string;
  guard_name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface County {
  id: string;
  name: string;
  code: string;
  description: string;
  region_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubCounty {
  id: string;
  name: string;
  code: string;
  description: string | null;
  county_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Division {
  id: string;
  name: string;
  code: string;
  description: string | null;
  sub_county_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  description: string | null;
  division_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubLocation {
  id: string;
  name: string;
  code: string;
  description: string | null;
  location_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Get levels from /lookup/levels
export const getLevels = async (): Promise<Level[]> => {
  const response = await axiosInstance.get<Level[]>("/lookup/levels");
  return response.data;
};

// Get roles from /lookup/roles
export const getRoles = async (): Promise<PaginatedResponse<Role>> => {
  const response =
    await axiosInstance.get<PaginatedResponse<Role>>("/lookup/roles");
  return response.data;
};

// Get regions from /geographic/regions
export const getGeographicRegions = async (): Promise<
  PaginatedResponse<Region>
> => {
  const response = await axiosInstance.get<PaginatedResponse<Region>>(
    "/geographic/regions",
  );
  return response.data;
};

// Get counties by region ID from /geographic/regions/{id}/counties
export const getCountiesByRegion = async (
  regionId: string,
): Promise<PaginatedResponse<County>> => {
  const response = await axiosInstance.get<PaginatedResponse<County>>(
    `/geographic/regions/${regionId}/counties`,
  );
  return response.data;
};

// Get sub-counties by county ID from /geographic/counties/{id}/subcounties
export const getSubCountiesByCounty = async (
  countyId: string,
): Promise<PaginatedResponse<SubCounty>> => {
  const response = await axiosInstance.get<PaginatedResponse<SubCounty>>(
    `/geographic/counties/${countyId}/subcounties`,
  );
  return response.data;
};

// Get divisions by sub-county ID from /geographic/subcounties/{id}/divisions
export const getDivisionsBySubCounty = async (
  subCountyId: string,
): Promise<PaginatedResponse<Division>> => {
  const response = await axiosInstance.get<PaginatedResponse<Division>>(
    `/geographic/subcounties/${subCountyId}/divisions`,
  );
  return response.data;
};

// Get locations by division ID from /geographic/divisions/{id}/locations
export const getLocationsByDivision = async (
  divisionId: string,
): Promise<PaginatedResponse<Location>> => {
  const response = await axiosInstance.get<PaginatedResponse<Location>>(
    `/geographic/divisions/${divisionId}/locations`,
  );
  return response.data;
};

// Get sub-locations by location ID from /geographic/locations/{id}/sublocations
export const getSubLocationsByLocation = async (
  locationId: string,
): Promise<PaginatedResponse<SubLocation>> => {
  const response = await axiosInstance.get<PaginatedResponse<SubLocation>>(
    `/geographic/locations/${locationId}/sublocations`,
  );
  return response.data;
};
