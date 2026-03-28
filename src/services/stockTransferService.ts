import axiosInstance from "@/lib/axios";

export interface StockTransfersParams {
  page?: number;
  per_page?: number;
  product_id?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  direction?: string;
  from_zone_id?: string;
  to_zone_id?: string;
}

// response structure may be dynamic; using any for now
export const getStockTransfers = async (
  params: StockTransfersParams = {},
): Promise<any> => {
  const response = await axiosInstance.get("/stock-levels/transfers", {
    params,
  });
  return response.data;
};
