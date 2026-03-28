import { useQuery } from "@tanstack/react-query";
import {
  getDashboardData,
  DashboardParams,
} from "../services/dashboardService";
import { Dashboard } from "@/types/dashboard";

// Hook for main dashboard data from /dashboard endpoint
export const useDashboard = (
  params?: DashboardParams,
  options?: { enabled?: boolean },
) => {
  return useQuery<Dashboard, Error>({
    queryKey: ["dashboard", params],
    queryFn: () => getDashboardData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  });
};
