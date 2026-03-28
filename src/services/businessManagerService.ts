import axiosInstance from "@/lib/axios";
import type {
  BusinessManager,
  BusinessManagersResponse,
  CreateBusinessManagerPayload,
  UpdateBusinessManagerPayload,
} from "@/types/businessManager";

export interface BusinessManagersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

// GET all business managers (with pagination & filters)
export const getBusinessManagers = async (
  params: BusinessManagersParams = {},
): Promise<BusinessManagersResponse> => {
  const response = await axiosInstance.get("/business-managers", { params });
  return response.data;
};

// GET single business manager by ID
export const getBusinessManager = async (
  id: string,
): Promise<BusinessManager> => {
  const response = await axiosInstance.get(`/business-managers/${id}`);
  return response.data;
};

// POST create business manager
export const createBusinessManager = async (
  data: CreateBusinessManagerPayload,
): Promise<BusinessManager> => {
  const response = await axiosInstance.post("/business-managers", data);
  return response.data.data || response.data;
};

// PATCH update business manager
export const updateBusinessManager = async (
  id: string,
  data: UpdateBusinessManagerPayload,
): Promise<BusinessManager> => {
  const response = await axiosInstance.patch(`/business-managers/${id}`, data);
  return response.data.data || response.data;
};

// DELETE business manager
export const deleteBusinessManager = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/business-managers/${id}`);
};
