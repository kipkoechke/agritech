import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// Query Keys
export const stockTransferQueryKeys = {
  all: ["stockTransfers"] as const,
  detail: (id: string) => [...stockTransferQueryKeys.all, "detail", id] as const,
} as const;

// Get single stock transfer
export function useStockTransfer(id: string) {
  return useQuery({
    queryKey: stockTransferQueryKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/stock-levels/transfers/show/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// INITIATE TRANSFER (uses new endpoint)
export function useInitiateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      // expecting payload to follow:
      // { to_zone_id: string, products: [{product_id, quantity, batches:[{batch_no,quantity}]}], metadata: {} }
      const { data } = await api.post("/stock-levels/transfers", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
    },
  });
}

// COMPLETE TRANSFER
export function useCompleteStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { 
      transferId: string;
      received_quantity: number;
      notes?: string;
    }) => {
      const { data } = await api.post(
        `/stock-levels/transfers/${payload.transferId}/complete`,
        { 
          received_quantity: payload.received_quantity,
          notes: payload.notes || undefined
        }
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: stockTransferQueryKeys.all });
      // Most importantly, invalidate the specific transfer detail query
      queryClient.invalidateQueries({ queryKey: stockTransferQueryKeys.detail(variables.transferId) });
      // Also refetch the specific query to force immediate update
      queryClient.refetchQueries({ queryKey: stockTransferQueryKeys.detail(variables.transferId) });
    },
  });
}

// CANCEL TRANSFER
export function useCancelStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferId: string) => {
      const { data } = await api.post(
        `/stock-levels/transfers/${transferId}/cancel`
      );
      return data;
    },
    onSuccess: (data, transferId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: stockTransferQueryKeys.all });
      // Most importantly, invalidate the specific transfer detail query
      queryClient.invalidateQueries({ queryKey: stockTransferQueryKeys.detail(transferId) });
      // Also refetch the specific query to force immediate update
      queryClient.refetchQueries({ queryKey: stockTransferQueryKeys.detail(transferId) });
    },
  });
}