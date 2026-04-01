import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  cancelSchedule,
  SchedulesParams,
} from "@/services/scheduleService";
import type { CreateScheduleData, UpdateScheduleData } from "@/types/schedule";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

export const useSchedules = (params: SchedulesParams = {}) => {
  return useQuery({
    queryKey: ["schedules", params],
    queryFn: () => getSchedules(params),
  });
};

export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => getSchedule(id),
    enabled: !!id,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleData) => createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create schedule"));
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleData }) =>
      updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["schedules", variables.id],
      });
      toast.success("Schedule updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update schedule"));
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete schedule"));
    },
  });
};

export const useCancelSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule cancelled successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to cancel schedule"));
    },
  });
};
