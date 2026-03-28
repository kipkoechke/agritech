import axiosInstance from "@/lib/axios";
import type {
  CreateUserPayload,
  User,
  UserDetailResponse,
  UsersQueryParams,
  UsersResponse,
  UpdateUserPayload,
  UserRole,
} from "@/types/user";

// Get all users
export const getUsers = async (
  page: number = 1,
  search?: string,
  params?: Partial<UsersQueryParams>,
): Promise<UsersResponse> => {
  const queryParams: UsersQueryParams = {
    page,
    per_page: 15,
    ...params,
  };

  if (search) {
    queryParams.search = search;
  }

  const response = await axiosInstance.get<UsersResponse>("/users", {
    params: queryParams,
  });
  return response.data;
};

// Get single user
export const getUser = async (id: string): Promise<User> => {
  const response = await axiosInstance.get<User>(`/users/${id}`);
  return response.data;
};

// Create user
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await axiosInstance.post<User>("/users", payload);
  return response.data;
};

// Update user
export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  const response = await axiosInstance.patch<User>(`/users/${id}`, payload);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

// Get user roles from /users/roles endpoint
export const getUserRoles = async (): Promise<UserRole[]> => {
  const response = await axiosInstance.get<UserRole[]>("/users/roles");
  return response.data;
};
