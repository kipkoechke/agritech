import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getTransporters,
  getTransporter,
  createTransporter,
  updateTransporter,
  deleteTransporter,
  TransportersParams,
} from "@/services/transporterService";
import type {
  CreateTransporterPayload,
  UpdateTransporterPayload,
} from "@/types/transporter";

// List hook with params
export const useTransporters = (params: TransportersParams = {}) => {
  return useQuery({
    queryKey: ["transporters", params],
    queryFn: () => getTransporters(params),
  });
};

// Single item hook
export const useTransporter = (id: string) => {
  return useQuery({
    queryKey: ["transporter", id],
    queryFn: () => getTransporter(id),
    enabled: !!id,
  });
};

// Prefetch transporters for pagination
export const usePrefetchTransporters = () => {
  const queryClient = useQueryClient();

  return (params: TransportersParams) => {
    queryClient.prefetchQuery({
      queryKey: ["transporters", params],
      queryFn: () => getTransporters(params),
    });
  };
};

// Create mutation with toast
export const useCreateTransporter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransporterPayload) => createTransporter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
      toast.success("Transporter created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create transporter"));
    },
  });
};

// Update mutation with toast
export const useUpdateTransporter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransporterPayload;
    }) => updateTransporter(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
      queryClient.invalidateQueries({
        queryKey: ["transporter", variables.id],
      });
      toast.success("Transporter updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update transporter"));
    },
  });
};

// Delete mutation with toast
export const useDeleteTransporter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransporter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
      toast.success("Transporter deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete transporter"));
    },
  });
};
