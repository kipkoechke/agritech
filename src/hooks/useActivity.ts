import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  ActivitiesParams,
} from "@/services/activityService";
import type { CreateActivityData, UpdateActivityData } from "@/types/activity";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

export const useActivities = (params: ActivitiesParams = {}) => {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => getActivities(params),
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ["activities", id],
    queryFn: () => getActivity(id),
    enabled: !!id,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityData) => createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Activity created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create activity"));
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityData }) =>
      updateActivity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({
        queryKey: ["activities", variables.id],
      });
      toast.success("Activity updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update activity"));
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Activity deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete activity"));
    },
  });
};
