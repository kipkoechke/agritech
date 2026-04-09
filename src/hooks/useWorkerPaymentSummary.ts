import { useQuery } from "@tanstack/react-query";
import { getWorkerPaymentSummary } from "@/services/workerPaymentSummaryService";
import type { WorkerPaymentSummaryParams } from "@/types/workerPaymentSummary";

export const useWorkerPaymentSummary = (
  params: WorkerPaymentSummaryParams = {},
) => {
  return useQuery({
    queryKey: ["worker-payment-summary", params],
    queryFn: () => getWorkerPaymentSummary(params),
    enabled: !!params.from_date && !!params.to_date,
  });
};
