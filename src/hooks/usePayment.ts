import { useQuery } from "@tanstack/react-query";
import { getPayments, getPayment, getPaymentRequests, PaymentRequestsParams } from "@/services/paymentService";
import type { PaymentsParams } from "@/types/payment";

export const usePayments = (params: PaymentsParams = {}) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => getPayments(params),
  });
};

export const usePaymentRequests = (params: PaymentRequestsParams = {}) => {
  return useQuery({
    queryKey: ["payment-requests", params],
    queryFn: () => getPaymentRequests(params),
  });
};

const usePayment = (id: string) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
};
