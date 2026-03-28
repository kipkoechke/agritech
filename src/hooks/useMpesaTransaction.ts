import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getMpesaTransactions,
  reconcileTransaction,
} from "@/services/mpesaTransactionService";
import type {
  MpesaTransactionsParams,
  ReconcileTransactionPayload,
} from "@/types/mpesaTransaction";

export const useMpesaTransactions = (params: MpesaTransactionsParams = {}) => {
  return useQuery({
    queryKey: ["mpesa-transactions", params],
    queryFn: () => getMpesaTransactions(params),
  });
};

export const useReconcileTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transId,
      data,
    }: {
      transId: string;
      data: ReconcileTransactionPayload;
    }) => reconcileTransaction(transId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mpesa-transactions"] });
      toast.success("Transaction reconciled successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to reconcile transaction"));
    },
  });
};
