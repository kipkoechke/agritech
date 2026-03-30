import axiosInstance from "@/lib/axios";
import type { Product, PriceHistory, CreateProductData, UpdateProductData, CreatePriceHistoryData } from "@/types/product";

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<{ data: Product[] }>("/products");
  return response.data.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get<{ data: Product }>(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (data: CreateProductData): Promise<Product> => {
  const response = await axiosInstance.post<{ data: Product }>("/products", data);
  return response.data.data;
};

export const updateProduct = async (id: string, data: UpdateProductData): Promise<Product> => {
  const response = await axiosInstance.put<{ data: Product }>(`/products/${id}`, data);
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/products/${id}`);
};

export const getProductPriceHistory = async (productId: string): Promise<PriceHistory[]> => {
  const response = await axiosInstance.get<{ data: PriceHistory[] }>(`/products/${productId}/price-history`);
  return response.data.data;
};

export const addProductPriceHistory = async (data: CreatePriceHistoryData): Promise<PriceHistory> => {
  const response = await axiosInstance.post<{ data: PriceHistory }>(`/products/${data.product_id}/price-history`, data);
  return response.data.data;
};

export const deleteProductPriceHistory = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/price-history/${id}`);
};