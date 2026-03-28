import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UsersQueryParams,
} from "../types/user";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  getUserRoles,
} from "@/services/userService";

// Get all users
export const useUsers = (
  page: number = 1,
  search?: string,
  params?: Partial<UsersQueryParams>,
) => {
  return useQuery({
    queryKey: ["users", page, search, params],
    queryFn: () => getUsers(page, search, params),
  });
};

// Prefetch next page of users
export const usePrefetchUsers = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (page: number, search?: string, params?: Partial<UsersQueryParams>) => {
      queryClient.prefetchQuery({
        queryKey: ["users", page, search, params],
        queryFn: () => getUsers(page, search, params),
      });
    },
    [queryClient],
  );
};

// Get single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const { mutate: createAUser, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create user. Please try again."),
      );
    },
  });

  return { createAUser, isCreating };
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update user. Please try again."),
      );
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to delete user. Please try again."),
      );
    },
  });
};

// Get user roles (from /users/roles endpoint)
export const useUserRoles = () => {
  return useQuery({
    queryKey: ["userRoles"],
    queryFn: () => getUserRoles(),
    staleTime: 10 * 60 * 1000, // 10 minutes - roles don't change often
  });
};
