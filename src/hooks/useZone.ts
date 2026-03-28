import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getZones,
  getZone,
  createZone,
  updateZone,
  deleteZone,
  ZonesParams,
} from "@/services/zoneService";
import type { CreateZonePayload, UpdateZonePayload } from "@/types/zone";

// List hook with params
export const useZones = (params: ZonesParams = {}) => {
  return useQuery({
    queryKey: ["zones", params],
    queryFn: () => getZones(params),
  });
};

// Single item hook
export const useZone = (id: string) => {
  return useQuery({
    queryKey: ["zone", id],
    queryFn: () => getZone(id),
    enabled: !!id,
  });
};

// Prefetch zones for pagination
export const usePrefetchZones = () => {
  const queryClient = useQueryClient();

  return (params: ZonesParams) => {
    queryClient.prefetchQuery({
      queryKey: ["zones", params],
      queryFn: () => getZones(params),
    });
  };
};

// Create mutation with toast
export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZonePayload) => createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create zone"));
    },
  });
};

// Update mutation with toast
export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateZonePayload }) =>
      updateZone(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["zone", variables.id] });
      toast.success("Zone updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update zone"));
    },
  });
};

// Delete mutation with toast
export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete zone"));
    },
  });
};
