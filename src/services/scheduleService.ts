import axiosInstance from "@/lib/axios";
import type {
  CreateScheduleData,
  UpdateScheduleData,
  SchedulesResponse,
  ScheduleResponse,
} from "@/types/schedule";

export interface SchedulesParams {
  page?: number;
  per_page?: number;
  farm_id?: string;
  farm_activity_id?: string;
  scheduled_date?: string;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export const getSchedules = async (
  params: SchedulesParams = {},
): Promise<SchedulesResponse> => {
  const response = await axiosInstance.get<SchedulesResponse>("/schedules", {
    params,
  });
  return response.data;
};

export const getSchedule = async (id: string): Promise<ScheduleResponse> => {
  const response = await axiosInstance.get<ScheduleResponse>(
    `/schedules/${id}`,
  );
  return response.data;
};

export const createSchedule = async (
  data: CreateScheduleData,
): Promise<ScheduleResponse> => {
  const response = await axiosInstance.post<ScheduleResponse>(
    "/schedules",
    data,
  );
  return response.data;
};

export const updateSchedule = async (
  id: string,
  data: UpdateScheduleData,
): Promise<ScheduleResponse> => {
  const response = await axiosInstance.patch<ScheduleResponse>(
    `/schedules/${id}`,
    data,
  );
  return response.data;
};

export const deleteSchedule = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/schedules/${id}`,
  );
  return response.data;
};

export const cancelSchedule = async (
  id: string,
): Promise<ScheduleResponse> => {
  const response = await axiosInstance.post<ScheduleResponse>(
    `/schedules/${id}/cancel`,
  );
  return response.data;
};
