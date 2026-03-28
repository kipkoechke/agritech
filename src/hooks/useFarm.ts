import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import farmService from "@/services/farmService";
import type { CreateFarmData } from "@/services/farmService";
import toast from "react-hot-toast";

export const farmKeys = {
  all: ["farms"] as const,
};

export const useFarms = () => {
  return useQuery({
    queryKey: farmKeys.all,
    queryFn: farmService.getAll,
  });
};

export const useCreateFarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFarmData) => farmService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmKeys.all });
      toast.success("Farm created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create farm");
    },
  });
};
