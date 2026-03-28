import axiosInstance from "@/lib/axios";
import type {
  BankTransactionsResponse,
  BankTransactionsParams,
  ReconcileBankTransactionPayload,
  BankTransaction,
} from "@/types/bankReconciliation";

export const getBankTransactions = async (
  params: BankTransactionsParams = {},
): Promise<BankTransactionsResponse> => {
  const response = await axiosInstance.get(
    "/admin/reconciliation/bank-transactions",
    { params },
  );
  return response.data;
};

export const reconcileBankTransaction = async (
  data: ReconcileBankTransactionPayload,
): Promise<BankTransaction> => {
  const response = await axiosInstance.post(
    "/admin/reconciliation/reconcile-bank",
    data,
  );
  return response.data;
};

