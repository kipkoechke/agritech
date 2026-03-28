import axiosInstance from "@/lib/axios";
import type {
  StockLevelsResponse,
  StockLevelDetailResponse,
  CreateStockLevelPayload,
  UpdateStockLevelPayload,
} from "@/types/stockLevel";

export interface StockLevelsParams {
  page?: number;
  per_page?: number;
  search?: string;
  product_id?: string;
  zone_id?: string;
}

// GET all stock levels (with pagination & filters)
export const getStockLevels = async (
  params: StockLevelsParams = {},
): Promise<StockLevelsResponse> => {
  const response = await axiosInstance.get("/stock-levels", { params });
  return response.data;
};

// GET single stock level by ID
export const getStockLevel = async (
  id: string,
): Promise<StockLevelDetailResponse> => {
  const response = await axiosInstance.get(`/stock-levels/${id}`);
  return response.data;
};

// POST create stock level
export const createStockLevel = async (
  data: CreateStockLevelPayload,
): Promise<StockLevelDetailResponse> => {
  const response = await axiosInstance.post("/stock-levels", data);
  return response.data.data || response.data;
};

// PATCH update stock level
export const updateStockLevel = async (
  id: string,
  data: UpdateStockLevelPayload,
): Promise<StockLevelDetailResponse> => {
  const response = await axiosInstance.patch(`/stock-levels/${id}`, data);
  return response.data.data || response.data;
};

// DELETE stock level
export const deleteStockLevel = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/stock-levels/${id}`);
};
