import axiosInstance from "@/lib/axios";
import type {
  CreateFarmData,
  UpdateFarmData,
  FarmsResponse,
  FarmResponse,
} from "@/types/farm";

export interface FarmsParams {
  page?: number;
  per_page?: number;
  search?: string;
  zone_id?: string;
  product_id?: string;
  owner_id?: string;
  supervisor_id?: string;
  min_size?: number;
  max_size?: number;
}

export const getFarms = async (
  params: FarmsParams = {},
): Promise<FarmsResponse> => {
  const response = await axiosInstance.get<FarmsResponse>("/farms", { params });
  return response.data;
};

export const getClusterFarms = async (
  clusterId: string,
): Promise<FarmsResponse> => {
  const response = await axiosInstance.get<FarmsResponse>(
    `/clusters/${clusterId}/farms`,
  );
  return response.data;
};

export const getMineFarms = async (
  params: FarmsParams = {},
): Promise<FarmsResponse> => {
  const response = await axiosInstance.get<FarmsResponse>("/farms/mine", {
    params,
  });
  return response.data;
};

export const getFarm = async (id: string): Promise<FarmResponse> => {
  const response = await axiosInstance.get<FarmResponse>(`/farms/${id}`);
  return response.data;
};

export const createFarm = async (
  data: CreateFarmData,
): Promise<FarmResponse> => {
  const response = await axiosInstance.post<FarmResponse>("/farms", data);
  return response.data;
};

export const updateFarm = async (
  id: string,
  data: UpdateFarmData,
): Promise<FarmResponse> => {
  const response = await axiosInstance.patch<FarmResponse>(
    `/farms/${id}`,
    data,
  );
  return response.data;
};

export const deleteFarm = async (id: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/farms/${id}`,
  );
  return response.data;
};

export const assignSupervisor = async (
  id: string,
  supervisor_id: string,
): Promise<FarmResponse> => {
  const response = await axiosInstance.post<FarmResponse>(
    `/farms/${id}/supervisor`,
    { supervisor_id },
  );
  return response.data;
};
