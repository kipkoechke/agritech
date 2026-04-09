import axiosInstance from "@/lib/axios";
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UsersResponse,
} from "@/types/user";
import type {
  HrisUsersResponse,
  HrisUserResponse,
  CreateHrisUserData,
  UpdateHrisUserData,
} from "@/types/hrisUser";

export interface HrisUsersParams {
  page?: number;
  per_page?: number;
  supervisor_id?: string;
  role?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export const getUsers = async (
  params?: UserFilters,
): Promise<UsersResponse> => {
  const response = await axiosInstance.get<UsersResponse>("/users", { params });
  return response.data;
};

export const getHrisUsers = async (
  params: HrisUsersParams = {},
): Promise<HrisUsersResponse> => {
  const response = await axiosInstance.get<HrisUsersResponse>("/users", {
    params,
  });
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await axiosInstance.get<{ data: User }>(`/users/${id}`);
  return response.data.data;
};

export const getHrisUser = async (id: string): Promise<HrisUserResponse> => {
  const response = await axiosInstance.get<HrisUserResponse>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await axiosInstance.post<{ data: User }>("/users", data);
  return response.data.data;
};

export const createHrisUser = async (
  data: CreateHrisUserData,
): Promise<HrisUserResponse> => {
  const response = await axiosInstance.post<HrisUserResponse>("/users", data);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: UpdateUserData,
): Promise<User> => {
  const response = await axiosInstance.put<{ data: User }>(
    `/users/${id}`,
    data,
  );
  return response.data.data;
};

export const updateHrisUser = async (
  id: string,
  data: UpdateHrisUserData,
): Promise<HrisUserResponse> => {
  const response = await axiosInstance.patch<HrisUserResponse>(
    `/users/${id}`,
    data,
  );
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

export const getUserRoles = async (): Promise<
  { id: string; name: string }[]
> => {
  const response = await axiosInstance.get<{
    data: { id: string; name: string }[];
  }>("/users/roles");
  return response.data.data;
};
