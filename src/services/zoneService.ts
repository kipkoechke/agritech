import axiosInstance from "@/lib/axios";
import type {
  Zone,
  ZonesResponse,
  CreateZonePayload,
  UpdateZonePayload,
} from "@/types/zone";

export interface ZonesParams {
  page?: number;
  per_page?: number;
  search?: string;
  region_id?: string;
}

// GET all zones (with pagination & filters)
export const getZones = async (
  params: ZonesParams = {},
): Promise<ZonesResponse> => {
  const response = await axiosInstance.get("/zones", { params });
  return response.data;
};

// GET single zone by ID
export const getZone = async (id: string): Promise<Zone> => {
  const response = await axiosInstance.get(`/zones/${id}`);
  return response.data.data || response.data;
};

// POST create zone
export const createZone = async (data: CreateZonePayload): Promise<Zone> => {
  const response = await axiosInstance.post("/zones", data);
  return response.data.data || response.data;
};

// PATCH update zone
export const updateZone = async (
  id: string,
  data: UpdateZonePayload,
): Promise<Zone> => {
  const response = await axiosInstance.patch(`/zones/${id}`, data);
  return response.data.data || response.data;
};

// DELETE zone
export const deleteZone = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/zones/${id}`);
};
