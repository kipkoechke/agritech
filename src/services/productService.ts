import axiosInstance from "@/lib/axios";
import type { Product } from "@/types/product";

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<{ data: Product[] }>("/products");
  return response.data.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get<{ data: Product }>(`/products/${id}`);
  return response.data.data;
};
