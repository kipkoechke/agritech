import axiosInstance from "@/lib/axios";
import type {
  CreateActivityData,
  UpdateActivityData,
  ActivitiesResponse,
  ActivityResponse,
} from "@/types/activity";

export interface ActivitiesParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean | string;
  sort_by?: string;
  sort_order?: string;
}

export const getActivities = async (
  params: ActivitiesParams = {},
): Promise<ActivitiesResponse> => {
  const response = await axiosInstance.get<ActivitiesResponse>("/activities", {
    params,
  });
  return response.data;
};

export const getActivity = async (id: string): Promise<ActivityResponse> => {
  const response = await axiosInstance.get<ActivityResponse>(
    `/activities/${id}`,
  );
  return response.data;
};

export const createActivity = async (
  data: CreateActivityData,
): Promise<ActivityResponse> => {
  const response = await axiosInstance.post<ActivityResponse>(
    "/activities",
    data,
  );
  return response.data;
};

export const updateActivity = async (
  id: string,
  data: UpdateActivityData,
): Promise<ActivityResponse> => {
  const response = await axiosInstance.patch<ActivityResponse>(
    `/activities/${id}`,
    data,
  );
  return response.data;
};

export const deleteActivity = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/activities/${id}`,
  );
  return response.data;
};
