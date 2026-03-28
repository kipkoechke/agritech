import {
  createRank,
  deleteRank,
  getRank,
  getRanks,
  updateRank,
} from "@/services/rankService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

// Get all ranks
export const useRanks = () => {
  return useQuery({
    queryKey: ["ranks"],
    queryFn: () => getRanks(),
  });
};

// Get single rank
export const useRank = (id: string) => {
  return useQuery({
    queryKey: ["rank", id],
    queryFn: () => getRank(id),
    enabled: !!id,
  });
};

// Create rank
export const useCreateRank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      createRank(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ranks"] });
      toast.success("Rank created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create rank. Please try again."),
      );
    },
  });
};

// Update rank
export const useUpdateRank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; description: string };
    }) => updateRank(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ranks"] });
      toast.success("Rank updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update rank. Please try again."),
      );
    },
  });
};

// Delete rank
export const useDeleteRank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ranks"] });
      toast.success("Rank deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to delete rank. Please try again."),
      );
    },
  });
};
