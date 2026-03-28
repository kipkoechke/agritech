import axiosInstance from "@/lib/axios";
import type {
  MpesaTransactionsResponse,
  MpesaTransactionsParams,
  ReconcileTransactionPayload,
  MpesaTransaction,
} from "@/types/mpesaTransaction";

export const getMpesaTransactions = async (
  params: MpesaTransactionsParams = {},
): Promise<MpesaTransactionsResponse> => {
  const response = await axiosInstance.get(
    "/admin/reconciliation/mpesa-transactions",
    { params },
  );
  return response.data;
};

export const reconcileTransaction = async (
  transId: string,
  data: ReconcileTransactionPayload,
): Promise<MpesaTransaction> => {
  const response = await axiosInstance.post(
    `/admin/reconciliation/mpesa-transactions/${transId}/reconcile`,
    data,
  );
  return response.data;
};
