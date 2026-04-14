import axiosInstance from "../lib/axios";
import type {
  LoginCredentials,
  LogoutResponse,
  LoginResponse,
  User,
} from "../types/auth";
import { setAuthToken, setUserData, clearAuthData } from "../lib/auth";

const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
} as const;

export const login = async (
  credentials: LoginCredentials,
  remember: boolean = false,
): Promise<LoginResponse> => {
  if (!credentials.email?.trim()) {
    throw new Error("Email is required");
  }

  if (!credentials.password?.trim()) {
    throw new Error("Password is required");
  }

  const response = await axiosInstance.post<LoginResponse>(
    AUTH_ENDPOINTS.LOGIN,
    {
      email: credentials.email.trim(),
      password: credentials.password,
    },
  );

  if (!response.data?.token) {
    throw new Error("Invalid response from server");
  }

  const { token, user } = response.data;

  setAuthToken(token, remember);
  setUserData(user);

  return response.data;
};

const directLogin = login;

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post<LogoutResponse>(AUTH_ENDPOINTS.LOGOUT);
  clearAuthData();
};

export const getMe = async (): Promise<User> => {
  const response = await axiosInstance.get<{ data: User }>(AUTH_ENDPOINTS.ME);
  return response.data.data;
};

const clearAuthSession = (): void => {
  clearAuthData();
};
