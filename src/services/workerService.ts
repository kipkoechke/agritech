import axiosInstance from "@/lib/axios";
import type {
  CreateWorkerData,
  UpdateWorkerData,
  WorkersResponse,
  WorkerResponse,
} from "@/types/worker";

export interface WorkersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const getWorkers = async (
  params: WorkersParams = {},
): Promise<WorkersResponse> => {
  const response = await axiosInstance.get<WorkersResponse>("/workers", {
    params,
  });
  return response.data;
};

export const getWorker = async (id: string): Promise<WorkerResponse> => {
  const response = await axiosInstance.get<WorkerResponse>(`/workers/${id}`);
  return response.data;
};

export const createWorker = async (
  data: CreateWorkerData,
): Promise<WorkerResponse> => {
  const response = await axiosInstance.post<WorkerResponse>("/workers", data);
  return response.data;
};

export const updateWorker = async (
  id: string,
  data: UpdateWorkerData,
): Promise<WorkerResponse> => {
  const response = await axiosInstance.patch<WorkerResponse>(
    `/workers/${id}`,
    data,
  );
  return response.data;
};

export const deleteWorker = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/workers/${id}`,
  );
  return response.data;
};