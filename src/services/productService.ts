// services/productService.ts
import axiosInstance from "@/lib/axios";
import type { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  PriceHistory,
  CreatePriceHistoryData,
  ProductsResponse,
  ProductResponse,
  PriceHistoryResponse
} from "@/types/product";

export const getProducts = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string;
}): Promise<ProductsResponse> => {
  const response = await axiosInstance.get<ProductsResponse>("/products", { params });
  return response.data;
};

export const getProduct = async (id: string): Promise<ProductResponse> => {
  const response = await axiosInstance.get<ProductResponse>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: CreateProductData): Promise<ProductResponse> => {
  const response = await axiosInstance.post<ProductResponse>("/products", data);
  return response.data;
};

export const updateProduct = async (id: string, data: UpdateProductData): Promise<ProductResponse> => {
  const response = await axiosInstance.put<ProductResponse>(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/products/${id}`);
  return response.data;
};

export const getProductPriceHistory = async (productId: string): Promise<PriceHistoryResponse> => {
  const response = await axiosInstance.get<PriceHistoryResponse>(`/products/${productId}/price-history`);
  return response.data;
};

export const addProductPriceHistory = async (data: CreatePriceHistoryData): Promise<{ data: PriceHistory }> => {
  const response = await axiosInstance.post<{ data: PriceHistory }>(`/products/${data.product_id}/price-history`, data);
  return response.data;
};

export const deleteProductPriceHistory = async (id: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/price-history/${id}`);
  return response.data;
};