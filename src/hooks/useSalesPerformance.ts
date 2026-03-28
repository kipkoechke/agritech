import { useQuery } from "@tanstack/react-query";
import { getSalesPerformance } from "@/services/salesPerformanceService";
import type { SalesPerformanceParams } from "@/types/salesPerformance";

// Sales Rep Performance hook with params
export const useSalesPerformance = (params: SalesPerformanceParams = {}) => {
  return useQuery({
    queryKey: ["sales-performance", params],
    queryFn: () => getSalesPerformance(params),
  });
};
