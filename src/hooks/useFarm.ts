import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFarms,
  getMineFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
  assignSupervisor,
  FarmsParams,
} from "@/services/farmService";
import type { CreateFarmData, UpdateFarmData } from "@/types/farm";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

export const useFarms = (
  params: FarmsParams = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["farms", params],
    queryFn: () => getFarms(params),
    enabled: options?.enabled,
  });
};

export const useMineFarms = (
  params: FarmsParams = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["farms", "mine", params],
    queryFn: () => getMineFarms(params),
    enabled: options?.enabled,
  });
};

export const useFarm = (id: string) => {
  return useQuery({
    queryKey: ["farms", id],
    queryFn: () => getFarm(id),
    enabled: !!id,
  });
};

export const useCreateFarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFarmData) => createFarm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      toast.success("Farm created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create farm"));
    },
  });
};

export const useUpdateFarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmData }) =>
      updateFarm(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      queryClient.invalidateQueries({ queryKey: ["farms", variables.id] });
      toast.success("Farm updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update farm"));
    },
  });
};

export const useDeleteFarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      toast.success("Farm deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete farm"));
    },
  });
};

export const useAssignSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      supervisor_id,
    }: {
      id: string;
      supervisor_id: string;
    }) => assignSupervisor(id, supervisor_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      queryClient.invalidateQueries({ queryKey: ["farms", variables.id] });
      toast.success("Supervisor assigned successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to assign supervisor"));
    },
  });
};
