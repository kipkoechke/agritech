import { useQuery } from "@tanstack/react-query";
import { getPayments, getPayment } from "@/services/paymentService";
import type { PaymentsParams } from "@/types/payment";

export const usePayments = (params: PaymentsParams = {}) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => getPayments(params),
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
};
