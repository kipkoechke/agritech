import axiosInstance from "@/lib/axios";
import type {
  DepotPortalSalesPerson,
  DepotPortalSalesPersonsResponse,
  DepotPortalCustomer,
  DepotPortalCustomersResponse,
  DepotPortalOrder,
  DepotPortalOrdersResponse,
  DepotPortalPaymentsResponse,
  DepotPortalQueryParams,
} from "@/types/depotPortal";
import type { AmendOrderPayload } from "@/types/order";

/**
 * Get depot sales persons
 */
export const getDepotSalesPersons = async (
  params: DepotPortalQueryParams = {},
): Promise<DepotPortalSalesPersonsResponse> => {
  const response = await axiosInstance.get("/depot-managers/sales-persons", {
    params,
  });
  return response.data;
};

/**
 * Get a single depot sales person by ID
 */
export const getDepotSalesPerson = async (
  id: string,
): Promise<DepotPortalSalesPerson> => {
  const response = await axiosInstance.get(
    `/depot-managers/sales-persons/${id}`,
  );
  return response.data.data || response.data;
};

/**
 * Get customers for a specific depot sales person
 */
export const getDepotSalesPersonCustomers = async (
  id: string,
  params: DepotPortalQueryParams = {},
): Promise<DepotPortalCustomersResponse> => {
  const response = await axiosInstance.get(
    `/depot-managers/sales-persons/${id}/customers`,
    { params },
  );
  return response.data;
};

/**
 * Get orders for a specific depot sales person
 */
export const getDepotSalesPersonOrders = async (
  id: string,
  params: DepotPortalQueryParams = {},
): Promise<DepotPortalOrdersResponse> => {
  const response = await axiosInstance.get(
    `/depot-managers/sales-persons/${id}/orders`,
    { params },
  );
  return response.data;
};

/**
 * Get depot customers
 */
export const getDepotCustomers = async (
  params: DepotPortalQueryParams = {},
): Promise<DepotPortalCustomersResponse> => {
  const response = await axiosInstance.get("/depot-managers/customers", {
    params,
  });
  return response.data;
};

/**
 * Get a single depot customer by ID
 */
export const getDepotCustomer = async (
  id: string,
): Promise<DepotPortalCustomer> => {
  const response = await axiosInstance.get(`/depot-managers/customers/${id}`);
  return response.data.data || response.data;
};

/**
 * Get orders for a specific depot customer
 */
export const getDepotCustomerOrders = async (
  id: string,
  params: DepotPortalQueryParams = {},
): Promise<DepotPortalOrdersResponse> => {
  const response = await axiosInstance.get(
    `/depot-managers/customers/${id}/orders`,
    { params },
  );
  return response.data;
};

/**
 * Get depot orders
 */
export const getDepotOrders = async (
  params: DepotPortalQueryParams = {},
): Promise<DepotPortalOrdersResponse> => {
  const response = await axiosInstance.get("/depot-managers/orders", {
    params,
  });
  return response.data;
};

/**
 * Get a single depot order by ID
 */
export const getDepotOrder = async (id: string): Promise<DepotPortalOrder> => {
  const response = await axiosInstance.get(`/depot-managers/orders/${id}`);
  return response.data.data || response.data;
};

/**
 * Amend a depot order (update item quantities)
 */
export const amendDepotOrder = async (
  id: string,
  data: AmendOrderPayload,
): Promise<DepotPortalOrder> => {
  const response = await axiosInstance.patch(
    `/depot-managers/orders/${id}`,
    data,
  );
  return response.data.data || response.data;
};

/**
 * Get depot payments
 */
export const getDepotPayments = async (
  params: DepotPortalQueryParams = {},
): Promise<DepotPortalPaymentsResponse> => {
  const response = await axiosInstance.get("/depot-managers/payments", {
    params,
  });
  return response.data;
};
