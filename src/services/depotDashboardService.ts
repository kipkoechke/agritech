import axiosInstance from "@/lib/axios";
import type { DepotDashboardResponse } from "@/types/depotDashboard";

export interface DepotDashboardParams {
  start_date?: string;
  end_date?: string;
}

/**
 * Get depot dashboard data
 */
export const getDepotDashboard = async (
  params?: DepotDashboardParams,
): Promise<DepotDashboardResponse> => {
  const response = await axiosInstance.get("/depot-dashboard", { params });
  return response.data;
};
