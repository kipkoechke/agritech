import { Dashboard, DashboardParams } from "@/types/dashboard";
import axios from "../lib/axios";

// Get main dashboard data from /dashboard endpoint
export const getDashboardData = async (
  params?: DashboardParams,
): Promise<Dashboard> => {
  const { data } = await axios.get<Dashboard>("/dashboard", { params });
  return data;
};

export type { DashboardParams };
