import { useQuery } from "@tanstack/react-query";
import { getStockTransfers, StockTransfersParams } from "@/services/stockTransferService";

export const useStockTransfers = (params: StockTransfersParams = {}) => {
  return useQuery({
    queryKey: ["stock-transfers", params],
    queryFn: () => getStockTransfers(params),
  });
};
