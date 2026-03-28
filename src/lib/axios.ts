import axios from "axios";
import { getAuthToken, clearAuthData } from "./auth";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://dreamagritech.dreamguys.africa/api/v1",
  timeout: 10000,
  responseType: "json",
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.status, err.response?.data);

    // Handle authentication errors
    if (err.response?.status === 401) {
      // Token is invalid or expired
      clearAuthData();

      // Only redirect if we're not already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }

    // Handle forbidden access
    if (err.response?.status === 403) {
      console.error("Access forbidden:", err.response.data);
    }

    return Promise.reject(err);
  },
);

export default axiosInstance;
