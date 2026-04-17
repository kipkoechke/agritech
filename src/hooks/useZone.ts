import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
} from "@/services/zoneService";
import type { Zone } from "@/types/zone";
import toast from "react-hot-toast";

export const useZones = () => {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const response = await getZones();
      return response;
    },
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createZone(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create zone");
    },
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateZone(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update zone");
    },
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete zone");
    },
  });
};
