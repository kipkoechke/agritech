import { useQuery } from "@tanstack/react-query";
import { getWorkerPaymentSummary } from "@/services/workerPaymentSummaryService";
import type { WorkerPaymentSummaryParams } from "@/types/workerPaymentSummary";

export const useWorkerPaymentSummary = (
  params: WorkerPaymentSummaryParams = {},
) => {
  return useQuery({
    queryKey: ["worker-payment-summary", params],
    queryFn: () => getWorkerPaymentSummary(params),
  });
};
