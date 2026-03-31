// hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type {
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from "@/types/user";
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

// Query Keys
export const userQueryKeys = {
  all: ["users"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  list: (params?: UserFilters) => [...userQueryKeys.lists(), { params }] as const,
  details: () => [...userQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  roles: () => [...userQueryKeys.all, "roles"] as const,
};

// Get all users with filters
export const useUsers = (params?: UserFilters) => {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => getUsers(params),
  });
};

// Prefetch users with filters
export const usePrefetchUsers = () => {
  const queryClient = useQueryClient();

  return useCallback((params?: UserFilters) => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.list(params),
      queryFn: () => getUsers(params),
    });
  }, [queryClient]);
};

// Get single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserData) => createUser(payload),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create user. Please try again."),
      );
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(variables.id) });
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
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      toast.success("User deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to delete user. Please try again."),
      );
    },
  });
};

// Get user roles
export const useUserRoles = () => {
  return useQuery({
    queryKey: userQueryKeys.roles(),
    queryFn: () => getUserRoles(),
    staleTime: 10 * 60 * 1000, // 10 minutes - roles don't change often
  });
};

// Get supervisors (users with supervisor role)
export const useSupervisors = () => {
  return useQuery({
    queryKey: userQueryKeys.list({ role: "farm_supervisor" }),
    queryFn: () => getUsers({ role: "farm_supervisor", per_page: 100 }),
  });
};