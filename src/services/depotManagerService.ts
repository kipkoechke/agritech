import axiosInstance from "@/lib/axios";
import type {
  DepotManager,
  DepotManagersResponse,
  CreateDepotManagerPayload,
  UpdateDepotManagerPayload,
  DepotManagerDetailResponse,
} from "@/types/depotManager";

// Query params interface
export interface DepotManagersParams {
  page?: number;
  per_page?: number;
  status?: string;
  zone_id?: string;
  search?: string;
}

// GET all (with pagination & filters)
export const getDepotManagers = async (
  params: DepotManagersParams = {},
): Promise<DepotManagersResponse> => {
  const response = await axiosInstance.get("/depot-managers", { params });
  return response.data;
};

// GET single by ID
export const getDepotManager = async (id: string): Promise<DepotManager> => {
  const response = await axiosInstance.get<DepotManagerDetailResponse>(
    `/depot-managers/${id}`,
  );
  return response.data.message;
};

// POST create
export const createDepotManager = async (
  data: CreateDepotManagerPayload,
): Promise<DepotManager> => {
  const response = await axiosInstance.post("/depot-managers", data);
  return response.data;
};

// PATCH update
export const updateDepotManager = async (
  id: string,
  data: UpdateDepotManagerPayload,
): Promise<DepotManager> => {
  const response = await axiosInstance.patch(`/depot-managers/${id}`, data);
  return response.data;
};

// DELETE
export const deleteDepotManager = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/depot-managers/${id}`);
};
