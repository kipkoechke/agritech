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
  phone?: string;
}

export const getWorkers = async (
  params: WorkersParams = {},
): Promise<WorkersResponse> => {
  // If phone is present, use phone param and remove search
  const queryParams = { ...params };
  if (queryParams.phone) {
    delete queryParams.search;
  }
  const response = await axiosInstance.get<WorkersResponse>("/workers", {
    params: queryParams,
  });
  return response.data;
};

export const getClusterWorkers = async (
  clusterId: string,
): Promise<WorkersResponse> => {
  const response = await axiosInstance.get<WorkersResponse>(
    `/clusters/${clusterId}/workers`,
  );
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
