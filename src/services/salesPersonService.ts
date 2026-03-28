import axiosInstance from "@/lib/axios";
import type {
  SalesPerson,
  SalesPersonsResponse,
  CreateSalesPersonPayload,
  UpdateSalesPersonPayload,
} from "@/types/salesPerson";
import type {
  DepotPortalCustomersResponse,
  DepotPortalOrdersResponse,
} from "@/types/depotPortal";

// Query params interface
export interface SalesPersonsParams {
  page?: number;
  per_page?: number;
  status?: string;
  zone_id?: string;
  search?: string;
}

export interface SalesPersonSubResourceParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  payment_status?: string;
  delivery_status?: string;
}

// GET all (with pagination & filters)
export const getSalesPersons = async (
  params: SalesPersonsParams = {},
): Promise<SalesPersonsResponse> => {
  const response = await axiosInstance.get("/sales-persons", { params });
  return response.data;
};

// GET single by ID
export const getSalesPerson = async (id: string): Promise<SalesPerson> => {
  const response = await axiosInstance.get(`/sales-persons/${id}`);
  return response.data;
};

// POST create
export const createSalesPerson = async (
  data: CreateSalesPersonPayload,
): Promise<SalesPerson> => {
  const response = await axiosInstance.post("/sales-persons", data);
  return response.data;
};

// PATCH update
export const updateSalesPerson = async (
  id: string,
  data: UpdateSalesPersonPayload,
): Promise<SalesPerson> => {
  const response = await axiosInstance.patch(`/sales-persons/${id}`, data);
  return response.data;
};

// DELETE
export const deleteSalesPerson = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/sales-persons/${id}`);
};

// GET customers for a specific sales person
export const getSalesPersonCustomers = async (
  id: string,
  params: SalesPersonSubResourceParams = {},
): Promise<DepotPortalCustomersResponse> => {
  const response = await axiosInstance.get(`/sales-persons/${id}/customers`, {
    params,
  });
  return response.data;
};

// GET orders for a specific sales person
export const getSalesPersonOrders = async (
  id: string,
  params: SalesPersonSubResourceParams = {},
): Promise<DepotPortalOrdersResponse> => {
  const response = await axiosInstance.get(`/sales-persons/${id}/orders`, {
    params,
  });
  return response.data;
};
