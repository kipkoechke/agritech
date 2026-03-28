import axiosInstance from "@/lib/axios";
import type {
  StockRequestsResponse,
  StockRequestItem,
  CreateStockRequestPayload,
  UpdateStockRequestPayload,
  ApproveStockRequestPayload,
  RejectStockRequestPayload,
} from "@/types/stockRequest";

export interface StockRequestsParams {
  page?: number;
  per_page?: number;
  paginate?: boolean;
  product_id?: string;
  from_date?: string;
  to_date?: string;
  status?: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
  from_zone_id?: string;
  to_zone_id?: string;
  direction?: "incoming" | "outgoing" | "all";
}

// Get stock requests
export const getStockRequests = async (
  params: StockRequestsParams = {},
): Promise<StockRequestsResponse> => {
  const response = await axiosInstance.get("/stock-levels/requests", {
    params,
  });
  return response.data;
};

// Get single stock request
export const getStockRequest = async (id: string): Promise<StockRequestItem> => {
  const response = await axiosInstance.get(`/stock-levels/requests/${id}`);
  return response.data.data;
};

// Create stock request
export const createStockRequest = async (
  payload: CreateStockRequestPayload,
): Promise<StockRequestItem> => {
  const response = await axiosInstance.post("/stock-levels/requests", payload);
  return response.data.data;
};

// Update stock request
export const updateStockRequest = async (
  id: string,
  payload: UpdateStockRequestPayload,
): Promise<StockRequestItem> => {
  const response = await axiosInstance.put(`/stock-levels/requests/${id}`, payload);
  return response.data.data;
};

// Delete stock request
export const deleteStockRequest = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/stock-levels/requests/${id}`);
};

// Approve stock request
export const approveStockRequest = async (
  id: string,
  payload: ApproveStockRequestPayload,
): Promise<StockRequestItem> => {
  const response = await axiosInstance.post(`/stock-levels/requests/${id}/approve`, payload);
  return response.data.data;
};

// Reject stock request
export const rejectStockRequest = async (
  id: string,
  payload: RejectStockRequestPayload,
): Promise<StockRequestItem> => {
  const response = await axiosInstance.post(`/stock-levels/requests/${id}/reject`, payload);
  return response.data.data;
};

// Fulfill stock request
export const fulfillStockRequest = async (id: string): Promise<StockRequestItem> => {
  const response = await axiosInstance.post(`/stock-levels/requests/${id}/fulfill`);
  return response.data.data;
};
