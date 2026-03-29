import axiosInstance from "@/lib/axios";
import type { Farm, CreateFarmData, UpdateFarmData, ApiResponse } from "@/types/farm";

export const getFarms = async (): Promise<ApiResponse<Farm[]>> => {
  const response = await axiosInstance.get<ApiResponse<Farm[]>>("/farms");
  return response.data;
};

export const getFarm = async (id: string): Promise<ApiResponse<Farm>> => {
  const response = await axiosInstance.get<ApiResponse<Farm>>(`/farms/${id}`);
  return response.data;
};

export const createFarm = async (data: CreateFarmData): Promise<ApiResponse<Farm>> => {
  const response = await axiosInstance.post<ApiResponse<Farm>>("/farms", data);
  return response.data;
};

export const updateFarm = async (id: string, data: UpdateFarmData): Promise<ApiResponse<Farm>> => {
  const response = await axiosInstance.put<ApiResponse<Farm>>(`/farms/${id}`, data);
  return response.data;
};

export const deleteFarm = async (id: string): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.delete<ApiResponse<null>>(`/farms/${id}`);
  return response.data;
};