import axiosInstance from "../lib/axios";
import type {
  LoginCredentials,
  LogoutResponse,
  LoginResponse,
  User,
  UserProfile,
} from "../types/auth";
import { setAuthToken, setUserData, clearAuthData } from "../lib/auth";

// Auth API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/me",
} as const;

/**
 * Login - authenticates user and returns token directly
 */
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

  // Extract user data from response (excluding token)
  const { token, ...userData } = response.data;

  setAuthToken(token, remember);
  setUserData(userData as User);

  return response.data;
};

// Legacy alias for backwards compatibility
export const directLogin = login;

/**
 * Logout user and clear authentication data
 */
export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post<LogoutResponse>(AUTH_ENDPOINTS.LOGOUT);
  clearAuthData();
};

/**
 * Verify if current session is valid
 */
export const verifySession = async (): Promise<boolean> => {
  const response = await axiosInstance.get("/auth/verify");
  return response.status === 200;
};

/**
 * Get user profile from /profile endpoint
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>(AUTH_ENDPOINTS.PROFILE);
  return response.data;
};

/**
 * Clear authentication data (client-side only)
 */
export const clearAuthSession = (): void => {
  clearAuthData();
};
