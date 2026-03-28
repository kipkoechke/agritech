import axiosInstance from "@/lib/axios";
import type {
  PaymentsResponse,
  PaymentsParams,
  Payment,
} from "@/types/payment";

export const getPayments = async (
  params: PaymentsParams = {},
): Promise<PaymentsResponse> => {
  const response = await axiosInstance.get("/payments/mpesa-transactions", {
    params,
  });
  return response.data;
};

export const getPayment = async (id: string): Promise<Payment> => {
  const response = await axiosInstance.get(
    `/payments/mpesa-transactions/${id}`,
  );
  return response.data.data;
};
