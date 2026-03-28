import axiosInstance from "@/lib/axios";
import type { User, UsersResponse, CreateUserData, UpdateUserData } from "@/types/user";

export const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<UsersResponse>("/users");
  return response.data.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await axiosInstance.get<{ data: User }>(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await axiosInstance.post<{ data: User }>("/users", data);
  return response.data.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
  const response = await axiosInstance.put<{ data: User }>(`/users/${id}`, data);
  return response.data.data;
};
