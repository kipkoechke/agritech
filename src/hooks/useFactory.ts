import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFactories,
  getFactory,
  createFactory,
  updateFactory,
  deleteFactory,
  FactoriesParams,
} from "@/services/factoryService";
import type { CreateFactoryData, UpdateFactoryData } from "@/types/factory";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

export const useFactories = (params: FactoriesParams = {}) => {
  return useQuery({
    queryKey: ["factories", params],
    queryFn: () => getFactories(params),
  });
};

export const useFactory = (id: string) => {
  return useQuery({
    queryKey: ["factories", id],
    queryFn: () => getFactory(id),
    enabled: !!id,
  });
};

export const useCreateFactory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFactoryData) => createFactory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      toast.success("Factory created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create factory"));
    },
  });
};

export const useUpdateFactory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFactoryData }) =>
      updateFactory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      queryClient.invalidateQueries({
        queryKey: ["factories", variables.id],
      });
      toast.success("Factory updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update factory"));
    },
  });
};

export const useDeleteFactory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFactory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      toast.success("Factory deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete factory"));
    },
  });
};
