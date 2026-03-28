import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getBusinessManagers,
  getBusinessManager,
  createBusinessManager,
  updateBusinessManager,
  deleteBusinessManager,
  BusinessManagersParams,
} from "@/services/businessManagerService";
import type {
  CreateBusinessManagerPayload,
  UpdateBusinessManagerPayload,
} from "@/types/businessManager";

// List hook with params
export const useBusinessManagers = (params: BusinessManagersParams = {}) => {
  return useQuery({
    queryKey: ["business-managers", params],
    queryFn: () => getBusinessManagers(params),
  });
};

// Prefetch business managers for pagination
export const usePrefetchBusinessManagers = () => {
  const queryClient = useQueryClient();

  return (params: BusinessManagersParams) => {
    queryClient.prefetchQuery({
      queryKey: ["business-managers", params],
      queryFn: () => getBusinessManagers(params),
    });
  };
};

// Single item hook
export const useBusinessManager = (id: string) => {
  return useQuery({
    queryKey: ["business-manager", id],
    queryFn: () => getBusinessManager(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateBusinessManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBusinessManagerPayload) =>
      createBusinessManager(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-managers"] });
      toast.success("Business manager created successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create business manager"),
      );
    },
  });
};

// Update mutation with toast
export const useUpdateBusinessManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBusinessManagerPayload;
    }) => updateBusinessManager(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["business-managers"] });
      queryClient.invalidateQueries({
        queryKey: ["business-manager", variables.id],
      });
      toast.success("Business manager updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update business manager"),
      );
    },
  });
};

// Delete mutation with toast
export const useDeleteBusinessManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBusinessManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-managers"] });
      toast.success("Business manager deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to delete business manager"),
      );
    },
  });
};
