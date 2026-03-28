import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getDispatches,
  getDispatch,
  createDispatch,
} from "@/services/dispatchService";
import type {
  DispatchesQueryParams,
  CreateDispatchPayload,
} from "@/types/dispatch";

// List hook with params
export const useDispatches = (params: DispatchesQueryParams = {}) => {
  return useQuery({
    queryKey: ["dispatches", params],
    queryFn: () => getDispatches(params),
  });
};

// Single item hook
export const useDispatch = (id: string) => {
  return useQuery({
    queryKey: ["dispatch", id],
    queryFn: () => getDispatch(id),
    enabled: !!id,
  });
};

// Create dispatch mutation with toast
export const useCreateDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDispatchPayload) => createDispatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["depot-orders"] });
      toast.success("Orders dispatched successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to dispatch orders"));
    },
  });
};
