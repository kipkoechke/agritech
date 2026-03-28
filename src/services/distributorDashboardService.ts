import axiosInstance from "@/lib/axios";
import type { DistributorDashboardResponse } from "@/types/distributorDashboard";

export interface DistributorDashboardParams {
  start_date?: string;
  end_date?: string;
}

// GET distributor dashboard data
export const getDistributorDashboard = async (
  params: DistributorDashboardParams = {},
): Promise<DistributorDashboardResponse> => {
  const response = await axiosInstance.get("/distributor-dashboard", {
    params,
  });
  return response.data;
};
