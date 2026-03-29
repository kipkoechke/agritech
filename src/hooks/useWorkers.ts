import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkers, getWorker, createWorker, updateWorker, deleteWorker } from "@/services/workerService";
import type { CreateWorkerData, UpdateWorkerData } from "@/types/worker";
import toast from "react-hot-toast";

export const useWorkers = () => {
  return useQuery({
    queryKey: ["workers"],
    queryFn: getWorkers,
  });
};

export const useWorker = (id: string) => {
  return useQuery({
    queryKey: ["workers", id],
    queryFn: () => getWorker(id),
    enabled: !!id,
  });
};

export const useCreateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkerData) => createWorker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create worker");
    },
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkerData }) => updateWorker(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workers", variables.id] });
      toast.success("Worker updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update worker");
    },
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorker(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete worker");
    },
  });
};