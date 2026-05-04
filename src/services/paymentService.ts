import axiosInstance from "@/lib/axios";
import type {
  PaymentsResponse,
  PaymentsParams,
  Payment,
} from "@/types/payment";

export interface PaymentRequestsParams {
  page?: number;
  per_page?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
}

export interface PaymentRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  schedule?: {
    id: string;
    reference_code: string;
  };
}

export interface PaymentRequestsResponse {
  data: PaymentRequest[];
  pagination?: {
    current_page: number;
    next_page: boolean | null;
    total_pages: number;
    total_items: number;
  };
}

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

export const getPaymentRequests = async (
  params: PaymentRequestsParams = {},
): Promise<PaymentRequestsResponse> => {
  const response = await axiosInstance.get<PaymentRequestsResponse>(
    "/payment-requests",
    { params },
  );
  return response.data;
};
