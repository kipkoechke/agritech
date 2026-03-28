import axiosInstance from "@/lib/axios";
import type {
  MTCustomer,
  MTCustomersResponse,
  CreateMTCustomerPayload,
  UpdateMTCustomerPayload,
  SetMTCustomerPricesPayload,
  MTCustomerProductPrice,
} from "@/types/mtCustomer";

export interface MTCustomersParams {
  page?: number;
  per_page?: number;
  customer_id?: string;
  zone_id?: string;
  sales_person_id?: string;
  search?: string;
}

// GET all MT customers (with pagination & filters)
export const getMTCustomers = async (
  params: MTCustomersParams = {},
): Promise<MTCustomersResponse> => {
  const response = await axiosInstance.get("/mt/customers", { params });
  return response.data;
};

// GET single MT customer by ID
export const getMTCustomer = async (id: string): Promise<MTCustomer> => {
  const response = await axiosInstance.get(
    `/mt/customers`,
    { params: { customer_id: id } },
  );
  const data = response.data as MTCustomersResponse;
  return data.data[0];
};

// POST create MT customer
export const createMTCustomer = async (
  data: CreateMTCustomerPayload,
): Promise<MTCustomer> => {
  const response = await axiosInstance.post("/mt/customers", data);
  return response.data.data || response.data;
};

// PATCH update MT customer
export const updateMTCustomer = async (
  id: string,
  data: UpdateMTCustomerPayload,
): Promise<MTCustomer> => {
  const response = await axiosInstance.patch(`/mt/customers/${id}`, data);
  return response.data.data || response.data;
};

// DELETE MT customer
export const deleteMTCustomer = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/mt/customers/${id}`);
};

// GET MT customer product prices
export const getMTCustomerPrices = async (
  customerId: string,
): Promise<MTCustomerProductPrice[]> => {
  const response = await axiosInstance.get(
    `/mt/customer/${customerId}/prices`,
  );
  // Handle nested response structure
  return response.data.data?.products || response.data.data || response.data;
};

// SET MT customer product prices
export const setMTCustomerPrices = async (
  customerId: string,
  data: SetMTCustomerPricesPayload,
): Promise<MTCustomerProductPrice[]> => {
  const response = await axiosInstance.post(
    `/mt/customer/${customerId}/prices`,
    data,
  );
  // Handle nested response structure
  return response.data.data?.products || response.data.data || response.data;
};
