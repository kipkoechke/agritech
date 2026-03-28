import { useQuery } from "@tanstack/react-query";
import {
  getDistributorDashboard,
  DistributorDashboardParams,
} from "@/services/distributorDashboardService";

// Query Keys
export const distributorDashboardQueryKeys = {
  all: ["distributor-dashboard"] as const,
  dashboard: (params: DistributorDashboardParams = {}) =>
    [...distributorDashboardQueryKeys.all, params] as const,
} as const;

// Hook to fetch distributor dashboard data
export const useDistributorDashboard = (
  params: DistributorDashboardParams = {},
) => {
  return useQuery({
    queryKey: distributorDashboardQueryKeys.dashboard(params),
    queryFn: () => getDistributorDashboard(params),
  });
};
