import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  logoutUser,
  login,
  getMe,
} from "../services/authService";
import { getUserData, isAuthenticated, clearAuthData } from "../lib/auth";
import type {
  LoginCredentials,
  User,
  LoginResponse,
  UserRole,
} from "../types/auth";
import toast from "react-hot-toast";

// Query Keys
export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
} as const;

/**
 * Hook to get current user data
 */
export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: getUserData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated(),
  });

  const logout = () => {
    clearAuthData();
    queryClient.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated() && !!user,
    logout,
  };
};

/**
 * Hook for login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      credentials,
      remember,
    }: {
      credentials: LoginCredentials;
      remember?: boolean;
    }) => login(credentials, remember),
    onSuccess: (data: LoginResponse) => {
      queryClient.setQueryData(authQueryKeys.user(), data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });
};

export const useDirectLogin = useLogin;

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
    onError: (error: Error) => {
      console.error("Logout failed:", error);
      clearAuthData();
      queryClient.clear();
      toast.error("Logout failed, but you have been signed out locally");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });
};

/**
 * Hook to get current user without triggering a fetch
 */
export const useCurrentUser = (): User | null => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<User>(authQueryKeys.user()) || null;
};

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const { user } = useAuth();
  if (!user) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
};

/**
 * Hook to check if user is an administrator
 */
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === "admin";
};

/**
 * Hook to check if user is a farmer
 */
export const useIsFarmer = (): boolean => {
  const { user } = useAuth();
  return user?.role === "farmer";
};

/**
 * Hook to check if user is a farm supervisor
 */
export const useIsFarmSupervisor = (): boolean => {
  const { user } = useAuth();
  return user?.role === "farm_supervisor";
};

/**
 * Hook to check if user is a plucker
 */
export const useIsPlucker = (): boolean => {
  const { user } = useAuth();
  return user?.role === "plucker";
};

/**
 * Hook to get authentication status without triggering queries
 */
export const useAuthStatus = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<User>(authQueryKeys.user());

  return {
    isAuthenticated: isAuthenticated() && !!user,
    user,
  };
};
