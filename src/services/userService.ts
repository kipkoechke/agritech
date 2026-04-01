// services/userService.ts
import axiosInstance from "@/lib/axios";
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserFilters,
  UsersResponse,
  UserResponse,
  UserRole
} from "@/types/user";

export const getUsers = async (params?: UserFilters): Promise<UsersResponse> => {
  const response = await axiosInstance.get<UsersResponse>("/users", { 
    params: {
      page: params?.page,
      per_page: params?.per_page,
      search: params?.search,
      role: params?.role,
      supervisor_id: params?.supervisor_id,
      sort_by: params?.sort_by,
      sort_order: params?.sort_order,
    }
  });
  return response.data;
};

export const getUser = async (id: string): Promise<UserResponse> => {
  const response = await axiosInstance.get<UserResponse>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserData): Promise<UserResponse> => {
  const response = await axiosInstance.post<UserResponse>("/users", data);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<UserResponse> => {
  const response = await axiosInstance.put<UserResponse>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/users/${id}`);
  return response.data;
};

export const getUserRoles = async (): Promise<UserRole[]> => {
  const response = await axiosInstance.get<{ data: UserRole[] }>("/users/roles");
  return response.data.data;
};