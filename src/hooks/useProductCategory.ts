import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getProductCategories,
  getProductCategory,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  ProductCategoriesParams,
} from "@/services/productCategoryService";
import type {
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
} from "@/types/productCategory";

// List hook with params
export const useProductCategories = (params: ProductCategoriesParams = {}) => {
  return useQuery({
    queryKey: ["product-categories", params],
    queryFn: () => getProductCategories(params),
  });
};

// Prefetch product categories for pagination
export const usePrefetchProductCategories = () => {
  const queryClient = useQueryClient();

  return (params: ProductCategoriesParams) => {
    queryClient.prefetchQuery({
      queryKey: ["product-categories", params],
      queryFn: () => getProductCategories(params),
    });
  };
};

// Single item hook
export const useProductCategory = (id: string) => {
  return useQuery({
    queryKey: ["product-category", id],
    queryFn: () => getProductCategory(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductCategoryPayload) =>
      createProductCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Product category created successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create product category"),
      );
    },
  });
};

// Update mutation with toast
export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductCategoryPayload;
    }) => updateProductCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["product-category", variables.id],
      });
      toast.success("Product category updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update product category"),
      );
    },
  });
};

// Delete mutation with toast
export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Product category deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to delete product category"),
      );
    },
  });
};
