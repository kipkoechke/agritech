import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getBankTransactions,
  reconcileBankTransaction,
} from "@/services/bankReconciliationService";
import type {
  BankTransactionsParams,
  ReconcileBankTransactionPayload,
} from "@/types/bankReconciliation";

export const useBankTransactions = (params: BankTransactionsParams = {}) => {
  return useQuery({
    queryKey: ["bank-transactions", params],
    queryFn: () => getBankTransactions(params),
  });
};

export const useReconcileBankTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReconcileBankTransactionPayload) =>
      reconcileBankTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast.success("Bank transaction reconciled successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to reconcile bank transaction"),
      );
    },
  });
};

