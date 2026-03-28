// Token management utilities for cookie handling and authentication

import { User } from "../types/auth";

const TOKEN_KEY = "ravine_auth_token";
const USER_KEY = "ravine_user_data";

/**
 * Set authentication token in cookies
 */
export const setAuthToken = (
  token: string,
  remember: boolean = false,
): void => {
  try {
    const options = remember
      ? { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // 30 days
      : undefined; // Session cookie

    // Set cookie manually since we're in client-side
    const expires = options?.expires
      ? `; expires=${options.expires.toUTCString()}`
      : "";
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict${expires}`;
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

/**
 * Get authentication token from cookies
 */
export const getAuthToken = (): string | null => {
  try {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${TOKEN_KEY}=`),
    );

    if (tokenCookie) {
      return tokenCookie.split("=")[1];
    }

    return null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Remove authentication token from cookies
 */
export const removeAuthToken = (): void => {
  try {
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict`;
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

/**
 * Set user data in localStorage and cookie (for middleware access)
 */
export const setUserData = (user: User): void => {
  try {
    if (typeof window !== "undefined") {
      // Store in localStorage for client-side access
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Also store in cookie for middleware access
      const userDataString = encodeURIComponent(JSON.stringify(user));
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      document.cookie = `ravine_user_data=${userDataString}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
    }
  } catch (error) {
    console.error("Error setting user data:", error);
  }
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): User | null => {
  try {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Remove user data from localStorage and cookie
 */
export const removeUserData = (): void => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
      // Remove user data cookie
      document.cookie = `ravine_user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict`;
    }
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeUserData();
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Get Bearer token for API requests
 */
export const getBearerToken = (): string | null => {
  const token = getAuthToken();
  return token ? `Bearer ${token}` : null;
};
