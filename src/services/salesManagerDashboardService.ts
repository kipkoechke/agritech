import axiosInstance from "@/lib/axios";
import type { SalesManagerDashboardResponse } from "@/types/salesManagerDashboard";

export interface SalesManagerDashboardParams {
  start_date?: string;
  end_date?: string;
}

// GET sales manager dashboard data
export const getSalesManagerDashboard = async (
  params: SalesManagerDashboardParams = {},
): Promise<SalesManagerDashboardResponse> => {
  const response = await axiosInstance.get("/sales-manager-dashboard", {
    params,
  });
  return response.data;
};
