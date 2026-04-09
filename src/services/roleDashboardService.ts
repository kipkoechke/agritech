import axiosInstance from "@/lib/axios";
import type {
  AdminDashboardParams,
  AdminDashboardResponse,
  FarmerDashboardParams,
  FarmerDashboardResponse,
  SupervisorDashboardParams,
  SupervisorDashboardResponse,
} from "@/types/roleDashboard";

export const getAdminDashboard = async (
  params: AdminDashboardParams = {},
): Promise<AdminDashboardResponse> => {
  const response = await axiosInstance.get<AdminDashboardResponse>(
    "/dashboard/admin",
    { params },
  );
  return response.data;
};

export const getFarmerDashboard = async (
  params: FarmerDashboardParams = {},
): Promise<FarmerDashboardResponse> => {
  const response = await axiosInstance.get<FarmerDashboardResponse>(
    "/dashboard/farmer",
    { params },
  );
  return response.data;
};

export const getSupervisorDashboard = async (
  params: SupervisorDashboardParams = {},
): Promise<SupervisorDashboardResponse> => {
  const response = await axiosInstance.get<SupervisorDashboardResponse>(
    "/dashboard/supervisor",
    { params },
  );
  return response.data;
};
