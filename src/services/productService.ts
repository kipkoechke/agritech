import axiosInstance from "@/lib/axios";
import type {
  Product,
  ProductsResponse,
  ProductDetailResponse,
  CreateProductPayload,
  UpdateProductPayload,
  PriceHistoryResponse,
} from "@/types/product";

export interface ProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string;
  is_active?: boolean;
}

// GET all products (with pagination & filters)
export const getProducts = async (
  params: ProductsParams = {},
): Promise<ProductsResponse> => {
  const response = await axiosInstance.get("/products", { params });
  return response.data;
};

// GET single product by ID
export const getProduct = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get<ProductDetailResponse>(
    `/products/${id}`,
  );
  return response.data.data;
};

// Helper to build FormData from payload
const buildProductFormData = (
  data: CreateProductPayload | UpdateProductPayload,
): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else if (key === "image" && typeof value === "string" && value === "") {
      formData.append("image", "");
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

// POST create product
export const createProduct = async (
  data: CreateProductPayload,
): Promise<Product> => {
  const formData = buildProductFormData(data);
  const response = await axiosInstance.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data || response.data;
};

// PATCH update product
export const updateProduct = async (
  id: string,
  data: UpdateProductPayload,
): Promise<Product> => {
  const formData = buildProductFormData(data);
  const response = await axiosInstance.patch(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data || response.data;
};

// DELETE product
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/products/${id}`);
};

// GET product price history
export const getProductPriceHistory = async (
  productId: string,
  params: { page?: number; per_page?: number } = {},
): Promise<PriceHistoryResponse> => {
  const response = await axiosInstance.get(
    `/products/${productId}/price-history`,
    { params },
  );
  return response.data;
};
