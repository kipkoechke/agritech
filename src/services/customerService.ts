import axiosInstance from "@/lib/axios";
import type {
  Customer,
  CustomersResponse,
  CustomerDetailResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/types/customer";

export interface CustomersParams {
  page?: number;
  per_page?: number;
  search?: string;
  zone_id?: string;
  category_id?: string;
}

// GET all customers (with pagination & filters)
export const getCustomers = async (
  params: CustomersParams = {},
): Promise<CustomersResponse> => {
  const response = await axiosInstance.get("/customers", { params });
  return response.data;
};

// GET single customer by ID
export const getCustomer = async (id: string): Promise<Customer> => {
  const response = await axiosInstance.get<CustomerDetailResponse>(
    `/customers/${id}`,
  );
  return response.data.data;
};

// POST create customer
export const createCustomer = async (
  data: CreateCustomerPayload,
): Promise<Customer> => {
  const response = await axiosInstance.post("/customers", data);
  return response.data.data || response.data;
};

// PATCH update customer
export const updateCustomer = async (
  id: string,
  data: UpdateCustomerPayload,
): Promise<Customer> => {
  const response = await axiosInstance.patch(`/customers/${id}`, data);
  return response.data.data || response.data;
};

// DELETE customer
export const deleteCustomer = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/customers/${id}`);
};
