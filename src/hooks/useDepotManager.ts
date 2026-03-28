import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getDepotManagers,
  getDepotManager,
  createDepotManager,
  updateDepotManager,
  deleteDepotManager,
  DepotManagersParams,
} from "@/services/depotManagerService";
import type {
  CreateDepotManagerPayload,
  UpdateDepotManagerPayload,
} from "@/types/depotManager";

// List hook with params
export const useDepotManagers = (params: DepotManagersParams = {}) => {
  return useQuery({
    queryKey: ["depot-managers", params],
    queryFn: () => getDepotManagers(params),
  });
};

// Single item hook
export const useDepotManager = (id: string) => {
  return useQuery({
    queryKey: ["depot-manager", id],
    queryFn: () => getDepotManager(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateDepotManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepotManagerPayload) => createDepotManager(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depot-managers"] });
      toast.success("Depot manager created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create depot manager"));
    },
  });
};

// Update mutation with toast
export const useUpdateDepotManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDepotManagerPayload;
    }) => updateDepotManager(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["depot-managers"] });
      queryClient.invalidateQueries({
        queryKey: ["depot-manager", variables.id],
      });
      toast.success("Depot manager updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update depot manager"));
    },
  });
};

// Delete mutation with toast
export const useDeleteDepotManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepotManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depot-managers"] });
      toast.success("Depot manager deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete depot manager"));
    },
  });
};
