import axiosInstance from "@/lib/axios";
import type { Worker, CreateWorkerData, UpdateWorkerData, ApiResponse } from "@/types/worker";

export const getWorkers = async (): Promise<ApiResponse<Worker[]>> => {
  const response = await axiosInstance.get<ApiResponse<Worker[]>>("/workers");
  return response.data;
};

export const getWorker = async (id: string): Promise<ApiResponse<Worker>> => {
  const response = await axiosInstance.get<ApiResponse<Worker>>(`/workers/${id}`);
  return response.data;
};

export const createWorker = async (data: CreateWorkerData): Promise<ApiResponse<Worker>> => {
  const response = await axiosInstance.post<ApiResponse<Worker>>("/workers", data);
  return response.data;
};

export const updateWorker = async (id: string, data: UpdateWorkerData): Promise<ApiResponse<Worker>> => {
  const response = await axiosInstance.put<ApiResponse<Worker>>(`/workers/${id}`, data);
  return response.data;
};

export const deleteWorker = async (id: string): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.delete<ApiResponse<null>>(`/workers/${id}`);
  return response.data;
};