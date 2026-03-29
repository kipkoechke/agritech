import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFarms, getFarm, createFarm, updateFarm, deleteFarm } from "@/services/farmService";
import type { CreateFarmData, UpdateFarmData } from "@/types/farm";
import toast from "react-hot-toast";

export const useFarms = () => {
  return useQuery({
    queryKey: ["farms"],
    queryFn: getFarms,
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
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create farm");
    },
  });
};

export const useUpdateFarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmData }) => updateFarm(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      queryClient.invalidateQueries({ queryKey: ["farms", variables.id] });
      toast.success("Farm updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update farm");
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
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete farm");
    },
  });
};