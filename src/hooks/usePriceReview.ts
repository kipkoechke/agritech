import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getPriceReviews,
  getPriceReview,
  createPriceReview,
  updatePriceReview,
  deletePriceReview,
  addProductsToPriceReview,
  requestApprovalPriceReview,
  approvePriceReview,
  rejectPriceReview,
} from "@/services/priceReviewService";
import type {
  CreatePriceReviewPayload,
  UpdatePriceReviewPayload,
  AddProductsToPriceReviewPayload,
  PriceReviewsQueryParams,
} from "@/types/priceReview";
import { getApiErrorMessage } from "@/utils/getApiError";

// List hook with params
export const usePriceReviews = (params: PriceReviewsQueryParams = {}) => {
  return useQuery({
    queryKey: ["price-reviews", params],
    queryFn: () => getPriceReviews(params),
  });
};

// Prefetch price reviews for pagination
export const usePrefetchPriceReviews = () => {
  const queryClient = useQueryClient();

  return (params: PriceReviewsQueryParams) => {
    queryClient.prefetchQuery({
      queryKey: ["price-reviews", params],
      queryFn: () => getPriceReviews(params),
    });
  };
};

// Single item hook
export const usePriceReview = (id: string) => {
  return useQuery({
    queryKey: ["price-review", id],
    queryFn: () => getPriceReview(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreatePriceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceReviewPayload) => createPriceReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-reviews"] });
      toast.success("Price review created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create price review"));
    },
  });
};

// Update mutation with toast
export const useUpdatePriceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePriceReviewPayload;
    }) => updatePriceReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["price-reviews"] });
      queryClient.invalidateQueries({
        queryKey: ["price-review", variables.id],
      });
      toast.success("Price review updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update price review"));
    },
  });
};

// Delete mutation with toast
export const useDeletePriceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePriceReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-reviews"] });
      toast.success("Price review deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete price review"));
    },
  });
};

// Add products to price review mutation
export const useAddProductsToPriceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AddProductsToPriceReviewPayload;
    }) => addProductsToPriceReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["price-reviews"] });
      queryClient.invalidateQueries({
        queryKey: ["price-review", variables.id],
      });
      toast.success("Products added to price review successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to add products to price review"),
      );
    },
  });
};

// Request approval mutation (Super Admin)
export const useRequestApprovalPriceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApprovalPriceReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["price-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["price-review", id] });
      toast.success("Approval requested successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to request approval"));
    },
  });
};

// Approve price review mutation (Business Manager)
export const useApprovePriceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvePriceReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["price-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["price-review", id] });
      toast.success("Price review approved successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to approve price review"));
    },
  });
};

// Reject price review mutation (Business Manager)
export const useRejectPriceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectPriceReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["price-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["price-review", id] });
      toast.success("Price review rejected successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to reject price review"));
    },
  });
};
