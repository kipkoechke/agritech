import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductPriceHistory,
  ProductsParams,
} from "@/services/productService";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/product";

// List hook with params
export const useProducts = (params: ProductsParams = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
};

// Prefetch products for pagination
export const usePrefetchProducts = () => {
  const queryClient = useQueryClient();

  return (params: ProductsParams) => {
    queryClient.prefetchQuery({
      queryKey: ["products", params],
      queryFn: () => getProducts(params),
    });
  };
};

// Single item hook
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductPayload) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create product"));
    },
  });
};

// Update mutation with toast
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      toast.success("Product updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update product"));
    },
  });
};

// Delete mutation with toast
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete product"));
    },
  });
};

// Price history hook
export const useProductPriceHistory = (
  productId: string,
  params: { page?: number; per_page?: number } = {},
) => {
  return useQuery({
    queryKey: ["product-price-history", productId, params],
    queryFn: () => getProductPriceHistory(productId, params),
    enabled: !!productId,
  });
};
