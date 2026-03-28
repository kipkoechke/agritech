import { useQuery } from "@tanstack/react-query";
import {
  getSalesManagerDashboard,
  SalesManagerDashboardParams,
} from "@/services/salesManagerDashboardService";

export const useSalesManagerDashboard = (
  params?: SalesManagerDashboardParams,
) => {
  return useQuery({
    queryKey: ["sales-manager-dashboard", params],
    queryFn: () => getSalesManagerDashboard(params),
  });
};
