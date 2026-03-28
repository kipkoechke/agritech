import axiosInstance from "@/lib/axios";
import type {
  SalesPerformanceData,
  SalesPerformanceResponse,
  SalesPerformanceParams,
} from "@/types/salesPerformance";

// GET Sales Rep Performance data
export const getSalesPerformance = async (
  params: SalesPerformanceParams = {},
): Promise<SalesPerformanceData> => {
  const response = await axiosInstance.get<SalesPerformanceResponse>(
    "/sales-persons/performance",
    { params },
  );
  return response.data.data;
};
