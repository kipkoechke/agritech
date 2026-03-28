import { useQuery } from "@tanstack/react-query";
import {
  getDepotDashboard,
  DepotDashboardParams,
} from "@/services/depotDashboardService";

export const depotDashboardQueryKeys = {
  all: ["depot-dashboard"] as const,
  dashboard: (params?: DepotDashboardParams) =>
    [...depotDashboardQueryKeys.all, params] as const,
};

/**
 * Hook to fetch depot dashboard data
 */
export const useDepotDashboard = (params?: DepotDashboardParams) => {
  return useQuery({
    queryKey: depotDashboardQueryKeys.dashboard(params),
    queryFn: () => getDepotDashboard(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
