import axiosInstance from "@/lib/axios";
import type {
  ProductCategory,
  ProductCategoriesResponse,
  ProductCategoryDetailResponse,
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
} from "@/types/productCategory";

export interface ProductCategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
}

// GET all product categories (with pagination & filters)
export const getProductCategories = async (
  params: ProductCategoriesParams = {},
): Promise<ProductCategoriesResponse> => {
  const response = await axiosInstance.get("/product-categories", { params });
  return response.data;
};

// GET single product category by ID
export const getProductCategory = async (
  id: string,
): Promise<ProductCategory> => {
  const response = await axiosInstance.get<ProductCategoryDetailResponse>(
    `/product-categories/${id}`,
  );
  return response.data.data;
};

// POST create product category
export const createProductCategory = async (
  data: CreateProductCategoryPayload,
): Promise<ProductCategory> => {
  const response = await axiosInstance.post("/product-categories", data);
  return response.data.data || response.data;
};

// PATCH update product category
export const updateProductCategory = async (
  id: string,
  data: UpdateProductCategoryPayload,
): Promise<ProductCategory> => {
  const response = await axiosInstance.patch(`/product-categories/${id}`, data);
  return response.data.data || response.data;
};

// DELETE product category
export const deleteProductCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/product-categories/${id}`);
};
