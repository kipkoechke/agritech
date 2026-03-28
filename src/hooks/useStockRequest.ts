import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getStockRequests,
  getStockRequest,
  createStockRequest,
  updateStockRequest,
  deleteStockRequest,
  approveStockRequest,
  rejectStockRequest,
  fulfillStockRequest,
  StockRequestsParams,
} from "@/services/stockRequestService";
import type {
  CreateStockRequestPayload,
  UpdateStockRequestPayload,
  ApproveStockRequestPayload,
  RejectStockRequestPayload,
} from "@/types/stockRequest";

// List hook with params
export const useStockRequests = (params: StockRequestsParams = {}) => {
  return useQuery({
    queryKey: ["stock-requests", params],
    queryFn: () => getStockRequests(params),
  });
};

// Single item hook
export const useStockRequest = (id: string) => {
  return useQuery({
    queryKey: ["stock-request", id],
    queryFn: () => getStockRequest(id),
    enabled: !!id,
  });
};

// Create mutation
export const useCreateStockRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStockRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] });
      toast.success("Stock request created successfully!");
    },
    onError: (error: any) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to create stock request: ${errorMessage}`);
    },
  });
};

// Update mutation
export const useUpdateStockRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStockRequestPayload }) =>
      updateStockRequest(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stock-request", id] });
      toast.success("Stock request updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to update stock request: ${errorMessage}`);
    },
  });
};

// Delete mutation
export const useDeleteStockRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStockRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] });
      toast.success("Stock request deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to delete stock request: ${errorMessage}`);
    },
  });
};

// Approve mutation
export const useApproveStockRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApproveStockRequestPayload }) =>
      approveStockRequest(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stock-request", id] });
      toast.success("Stock request approved successfully!");
    },
    onError: (error: any) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to approve stock request: ${errorMessage}`);
    },
  });
};

// Reject mutation
export const useRejectStockRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectStockRequestPayload }) =>
      rejectStockRequest(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stock-request", id] });
      toast.success("Stock request rejected successfully!");
    },
    onError: (error: any) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to reject stock request: ${errorMessage}`);
    },
  });
};

// Fulfill mutation
export const useFulfillStockRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fulfillStockRequest,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stock-request", id] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      toast.success("Stock request fulfilled and transfer created successfully!");
    },
    onError: (error: any) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to fulfill stock request: ${errorMessage}`);
    },
  });
};
