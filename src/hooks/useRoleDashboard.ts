import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboard,
  getFarmerDashboard,
  getSupervisorDashboard,
} from "@/services/roleDashboardService";
import type {
  AdminDashboardParams,
  FarmerDashboardParams,
  SupervisorDashboardParams,
} from "@/types/roleDashboard";

export const useAdminDashboard = (params: AdminDashboardParams = {}) => {
  return useQuery({
    queryKey: ["dashboard-admin", params],
    queryFn: () => getAdminDashboard(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFarmerDashboard = (params: FarmerDashboardParams = {}) => {
  return useQuery({
    queryKey: ["dashboard-farmer", params],
    queryFn: () => getFarmerDashboard(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSupervisorDashboard = (
  params: SupervisorDashboardParams = {},
) => {
  return useQuery({
    queryKey: ["dashboard-supervisor", params],
    queryFn: () => getSupervisorDashboard(params),
    staleTime: 5 * 60 * 1000,
  });
};
