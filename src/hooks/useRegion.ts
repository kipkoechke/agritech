import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion,
  RegionsParams,
} from "@/services/regionService";
import type { CreateRegionPayload, UpdateRegionPayload } from "@/types/region";

// List hook with params
export const useRegions = (params: RegionsParams = {}) => {
  return useQuery({
    queryKey: ["regions", params],
    queryFn: () => getRegions(params),
  });
};

// Single item hook
export const useRegion = (id: string) => {
  return useQuery({
    queryKey: ["region", id],
    queryFn: () => getRegion(id),
    enabled: !!id,
  });
};

// Prefetch regions for pagination
export const usePrefetchRegions = () => {
  const queryClient = useQueryClient();

  return (params: RegionsParams) => {
    queryClient.prefetchQuery({
      queryKey: ["regions", params],
      queryFn: () => getRegions(params),
    });
  };
};

// Create mutation with toast
export const useCreateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRegionPayload) => createRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create region"));
    },
  });
};

// Update mutation with toast
export const useUpdateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegionPayload }) =>
      updateRegion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      queryClient.invalidateQueries({ queryKey: ["region", variables.id] });
      toast.success("Region updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update region"));
    },
  });
};

// Delete mutation with toast
export const useDeleteRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRegion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete region"));
    },
  });
};
