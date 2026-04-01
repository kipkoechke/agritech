import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHrisUsers,
  getHrisUser,
  createHrisUser,
  updateHrisUser,
  deleteUser,
  HrisUsersParams,
} from "@/services/userService";
import type { CreateHrisUserData, UpdateHrisUserData } from "@/types/hrisUser";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

export const useHrisUsers = (params: HrisUsersParams = {}) => {
  return useQuery({
    queryKey: ["hris-users", params],
    queryFn: () => getHrisUsers(params),
  });
};

export const useHrisUser = (id: string) => {
  return useQuery({
    queryKey: ["hris-users", id],
    queryFn: () => getHrisUser(id),
    enabled: !!id,
  });
};

export const useCreateHrisUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHrisUserData) => createHrisUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hris-users"] });
      toast.success("User created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create user"));
    },
  });
};

export const useUpdateHrisUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHrisUserData }) =>
      updateHrisUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hris-users"] });
      queryClient.invalidateQueries({
        queryKey: ["hris-users", variables.id],
      });
      toast.success("User updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update user"));
    },
  });
};

export const useDeleteHrisUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hris-users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete user"));
    },
  });
};
