import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClusters,
  getCluster,
  createCluster,
  updateCluster,
  deleteCluster,
  ClustersParams,
} from "@/services/clusterService";
import type { CreateClusterData, UpdateClusterData } from "@/types/cluster";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

export const useClusters = (params: ClustersParams = {}) => {
  return useQuery({
    queryKey: ["clusters", params],
    queryFn: () => getClusters(params),
  });
};

export const useCluster = (id: string) => {
  return useQuery({
    queryKey: ["clusters", id],
    queryFn: () => getCluster(id),
    enabled: !!id,
  });
};

export const useCreateCluster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClusterData) => createCluster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      toast.success("Cluster created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create cluster"));
    },
  });
};

export const useUpdateCluster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClusterData }) =>
      updateCluster(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({
        queryKey: ["clusters", variables.id],
      });
      toast.success("Cluster updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update cluster"));
    },
  });
};

export const useDeleteCluster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCluster(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      toast.success("Cluster deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete cluster"));
    },
  });
};
