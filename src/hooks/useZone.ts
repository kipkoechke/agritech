import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getZones, createZone, updateZone, deleteZone } from "@/services/zoneService";

export const useZones = () => {
  return useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => createZone(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateZone(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};