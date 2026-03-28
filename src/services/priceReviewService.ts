import axiosInstance from "@/lib/axios";
import type {
  PriceReview,
  PriceReviewsResponse,
  CreatePriceReviewPayload,
  UpdatePriceReviewPayload,
  AddProductsToPriceReviewPayload,
  PriceReviewsQueryParams,
} from "@/types/priceReview";

// GET all price reviews (with pagination & filters)
export const getPriceReviews = async (
  params: PriceReviewsQueryParams = {},
): Promise<PriceReviewsResponse> => {
  const response = await axiosInstance.get("/price-reviews", { params });
  return response.data;
};

// GET single price review by ID
export const getPriceReview = async (id: string): Promise<PriceReview> => {
  const response = await axiosInstance.get(`/price-reviews/${id}`);
  return response.data;
};

// POST create price review
export const createPriceReview = async (
  data: CreatePriceReviewPayload,
): Promise<PriceReview> => {
  const response = await axiosInstance.post("/price-reviews", data);
  return response.data;
};

// PATCH update price review
export const updatePriceReview = async (
  id: string,
  data: UpdatePriceReviewPayload,
): Promise<PriceReview> => {
  const response = await axiosInstance.patch(`/price-reviews/${id}`, data);
  return response.data;
};

// DELETE price review
export const deletePriceReview = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/price-reviews/${id}`);
};

// POST add products to price review
export const addProductsToPriceReview = async (
  id: string,
  data: AddProductsToPriceReviewPayload,
): Promise<PriceReview> => {
  const response = await axiosInstance.post(
    `/price-reviews/${id}/products`,
    data,
  );
  return response.data;
};

// PATCH request approval for price review (Super Admin)
export const requestApprovalPriceReview = async (
  id: string,
): Promise<PriceReview> => {
  const response = await axiosInstance.post(
    `/price-reviews/${id}/requestApproval`,
  );
  return response.data;
};

// PATCH approve price review (Business Manager)
export const approvePriceReview = async (id: string): Promise<PriceReview> => {
  const response = await axiosInstance.patch(`/price-reviews/${id}/approve`);
  return response.data;
};

// PATCH reject price review (Business Manager)
export const rejectPriceReview = async (id: string): Promise<PriceReview> => {
  const response = await axiosInstance.patch(`/price-reviews/${id}/reject`);
  return response.data;
};
