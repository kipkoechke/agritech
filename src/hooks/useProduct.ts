// hooks/useProduct.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductPriceHistory,
  addProductPriceHistory,
  deleteProductPriceHistory,
} from "@/services/productService";
import type { 
  CreateProductData, 
  UpdateProductData, 
  CreatePriceHistoryData,
  ProductsResponse,
  ProductResponse,
  PriceHistoryResponse
} from "@/types/product";
import toast from "react-hot-toast";

// Query Keys
export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (filters?: any) => [...productQueryKeys.lists(), { filters }] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
  priceHistory: (productId: string) => [...productQueryKeys.detail(productId), "price-history"] as const,
};

// Get all products with optional filters
export const useProducts = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string;
}) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getProducts(params),
  });
};

// Get single product
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
};

// Get product price history
export const useProductPriceHistory = (productId: string) => {
  return useQuery({
    queryKey: productQueryKeys.priceHistory(productId),
    queryFn: () => getProductPriceHistory(productId),
    enabled: !!productId,
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(variables.id) });
      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });
};

// Add product price history
export const useAddProductPriceHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceHistoryData) => addProductPriceHistory(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.priceHistory(variables.product_id) });
      toast.success("Price history added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add price history");
    },
  });
};

// Delete product price history
export const useDeleteProductPriceHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductPriceHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      toast.success("Price history deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete price history");
    },
  });
};

// Prefetch products (for SSR or optimistic loading)
export const usePrefetchProducts = (queryClient: any) => {
  return (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category_id?: string;
  }) => {
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.list(params),
      queryFn: () => getProducts(params),
    });
  };
};

// Prefetch single product
export const usePrefetchProduct = (queryClient: any, id: string) => {
  return () => {
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.detail(id),
      queryFn: () => getProduct(id),
    });
  };
};

// Prefetch product price history
export const usePrefetchProductPriceHistory = (queryClient: any, productId: string) => {
  return () => {
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.priceHistory(productId),
      queryFn: () => getProductPriceHistory(productId),
    });
  };
};