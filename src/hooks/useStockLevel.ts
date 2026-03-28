import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getStockLevels,
  getStockLevel,
  createStockLevel,
  updateStockLevel,
  deleteStockLevel,
  StockLevelsParams,
} from "@/services/stockLevelService";
import type {
  CreateStockLevelPayload,
  UpdateStockLevelPayload,
} from "@/types/stockLevel";

// List hook with params
export const useStockLevels = (params: StockLevelsParams = {}) => {
  return useQuery({
    queryKey: ["stock-levels", params],
    queryFn: () => getStockLevels(params),
  });
};

// Prefetch stock levels for pagination
export const usePrefetchStockLevels = () => {
  const queryClient = useQueryClient();

  return (params: StockLevelsParams) => {
    queryClient.prefetchQuery({
      queryKey: ["stock-levels", params],
      queryFn: () => getStockLevels(params),
    });
  };
};

// Single item hook
export const useStockLevel = (id: string) => {
  return useQuery({
    queryKey: ["stock-level", id],
    queryFn: () => getStockLevel(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateStockLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockLevelPayload) => createStockLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      toast.success("Stock level added successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to add stock level"));
    },
  });
};

// Update mutation with toast
export const useUpdateStockLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockLevelPayload }) =>
      updateStockLevel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      queryClient.invalidateQueries({
        queryKey: ["stock-level", variables.id],
      });
      toast.success("Stock level updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update stock level"));
    },
  });
};

// Delete mutation with toast
export const useDeleteStockLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStockLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      toast.success("Stock level deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete stock level"));
    },
  });
};
