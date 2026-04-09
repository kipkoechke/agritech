import axiosInstance from "@/lib/axios";
import type {
  WorkerPaymentSummaryParams,
  WorkerPaymentSummaryResponse,
} from "@/types/workerPaymentSummary";

export const getWorkerPaymentSummary = async (
  params: WorkerPaymentSummaryParams = {},
): Promise<WorkerPaymentSummaryResponse> => {
  const response = await axiosInstance.get<WorkerPaymentSummaryResponse>(
    "/worker-payment-summary",
    { params },
  );
  return response.data;
};
