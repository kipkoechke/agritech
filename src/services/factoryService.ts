import axiosInstance from "@/lib/axios";
import type {
  CreateFactoryData,
  UpdateFactoryData,
  FactoriesResponse,
  FactoryResponse,
} from "@/types/factory";

export interface FactoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  zone_id?: string;
  sort_by?: string;
  sort_order?: string;
}

export const getFactories = async (
  params: FactoriesParams = {},
): Promise<FactoriesResponse> => {
  const response = await axiosInstance.get<FactoriesResponse>("/factories", {
    params,
  });
  return response.data;
};

export const getFactory = async (id: string): Promise<FactoryResponse> => {
  const response = await axiosInstance.get<FactoryResponse>(
    `/factories/${id}`,
  );
  return response.data;
};

export const createFactory = async (
  data: CreateFactoryData,
): Promise<FactoryResponse> => {
  const response = await axiosInstance.post<FactoryResponse>(
    "/factories",
    data,
  );
  return response.data;
};

export const updateFactory = async (
  id: string,
  data: UpdateFactoryData,
): Promise<FactoryResponse> => {
  const response = await axiosInstance.patch<FactoryResponse>(
    `/factories/${id}`,
    data,
  );
  return response.data;
};

export const deleteFactory = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/factories/${id}`,
  );
  return response.data;
};
