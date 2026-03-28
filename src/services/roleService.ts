import axiosInstance from "@/lib/axios";
import type {
  Role,
  RolesResponse,
  RoleDetailResponse,
  CreateRolePayload,
  UpdateRolePayload,
  RolesQueryParams,
} from "@/types/role";

// Get all roles with pagination
export const getRoles = async (
  page: number = 1,
  search?: string,
  params?: Partial<RolesQueryParams>,
): Promise<RolesResponse> => {
  const queryParams: RolesQueryParams = {
    page,
    per_page: 15,
    ...params,
  };

  if (search) {
    queryParams.search = search;
  }

  const response = await axiosInstance.get<RolesResponse>("/roles", {
    params: queryParams,
  });
  return response.data;
};

// Get single role
export const getRole = async (id: string): Promise<RoleDetailResponse> => {
  const response = await axiosInstance.get<RoleDetailResponse>(`/roles/${id}`);
  return response.data;
};

// Create role
export const createRole = async (payload: CreateRolePayload): Promise<Role> => {
  const response = await axiosInstance.post<Role>("/roles", payload);
  return response.data;
};

// Update role
export const updateRole = async (
  id: string,
  payload: UpdateRolePayload,
): Promise<Role> => {
  const response = await axiosInstance.patch<Role>(`/roles/${id}`, payload);
  return response.data;
};

// Delete role
export const deleteRole = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/roles/${id}`);
};
