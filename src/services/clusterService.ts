import axiosInstance from "@/lib/axios";
import type {
  CreateClusterData,
  UpdateClusterData,
  ClustersResponse,
  ClusterResponse,
} from "@/types/cluster";

export interface ClustersParams {
  page?: number;
  per_page?: number;
  search?: string;
  factory_id?: string;
  zone_id?: string;
  sort_by?: string;
  sort_order?: string;
}

export const getClusters = async (
  params: ClustersParams = {},
): Promise<ClustersResponse> => {
  const response = await axiosInstance.get<ClustersResponse>("/clusters", {
    params,
  });
  return response.data;
};

export const getFactoryClusters = async (
  factoryId: string,
): Promise<ClustersResponse> => {
  const response = await axiosInstance.get<ClustersResponse>(
    `/factories/${factoryId}/clusters`,
  );
  return response.data;
};

export const getCluster = async (id: string): Promise<ClusterResponse> => {
  const response = await axiosInstance.get<ClusterResponse>(
    `/clusters/${id}`,
  );
  return response.data;
};

export const createCluster = async (
  data: CreateClusterData,
): Promise<ClusterResponse> => {
  const response = await axiosInstance.post<ClusterResponse>(
    "/clusters",
    data,
  );
  return response.data;
};

export const updateCluster = async (
  id: string,
  data: UpdateClusterData,
): Promise<ClusterResponse> => {
  const response = await axiosInstance.patch<ClusterResponse>(
    `/clusters/${id}`,
    data,
  );
  return response.data;
};

export const deleteCluster = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/clusters/${id}`,
  );
  return response.data;
};
