import axiosInstance from "@/lib/axios";
import type {
  Region,
  RegionsResponse,
  CreateRegionPayload,
  UpdateRegionPayload,
} from "@/types/region";

export interface RegionsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

// GET all regions (with pagination & filters)
export const getRegions = async (
  params: RegionsParams = {},
): Promise<RegionsResponse> => {
  const response = await axiosInstance.get("/regions", { params });
  return response.data;
};

// GET single region by ID
export const getRegion = async (id: string): Promise<Region> => {
  const response = await axiosInstance.get(`/regions/${id}`);
  return response.data.data;
};

// POST create region
export const createRegion = async (
  data: CreateRegionPayload,
): Promise<Region> => {
  const response = await axiosInstance.post("/regions", data);
  return response.data.data || response.data;
};

// PATCH update region
export const updateRegion = async (
  id: string,
  data: UpdateRegionPayload,
): Promise<Region> => {
  const response = await axiosInstance.patch(`/regions/${id}`, data);
  return response.data.data || response.data;
};

// DELETE region
export const deleteRegion = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/regions/${id}`);
};
