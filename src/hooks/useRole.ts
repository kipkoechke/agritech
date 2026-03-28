import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "@/services/roleService";
import type {
  CreateRolePayload,
  UpdateRolePayload,
  RolesQueryParams,
} from "@/types/role";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

// Get all roles with pagination
export const useRoles = (
  page: number = 1,
  search?: string,
  params?: Partial<RolesQueryParams>,
) => {
  return useQuery({
    queryKey: ["roles", page, search, params],
    queryFn: () => getRoles(page, search, params),
  });
};

// Prefetch next page of roles
export const usePrefetchRoles = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (page: number, search?: string, params?: Partial<RolesQueryParams>) => {
      queryClient.prefetchQuery({
        queryKey: ["roles", page, search, params],
        queryFn: () => getRoles(page, search, params),
      });
    },
    [queryClient],
  );
};

// Get single role
export const useRole = (id: string) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => getRole(id),
    enabled: !!id,
  });
};

// Create role
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create role. Please try again."),
      );
    },
  });
};

// Update role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role"] });
      toast.success("Role updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update role. Please try again."),
      );
    },
  });
};

// Delete role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to delete role. Please try again."),
      );
    },
  });
};
