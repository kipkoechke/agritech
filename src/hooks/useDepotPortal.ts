import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getDepotSalesPersons,
  getDepotSalesPerson,
  getDepotSalesPersonCustomers,
  getDepotSalesPersonOrders,
  getDepotCustomers,
  getDepotCustomer,
  getDepotCustomerOrders,
  getDepotOrders,
  getDepotOrder,
  getDepotPayments,
  amendDepotOrder,
} from "@/services/depotPortalService";
import type { DepotPortalQueryParams } from "@/types/depotPortal";
import type { AmendOrderPayload } from "@/types/order";

export const depotPortalQueryKeys = {
  all: ["depot-portal"] as const,
  salesPersons: (params: DepotPortalQueryParams) =>
    [...depotPortalQueryKeys.all, "sales-persons", params] as const,
  salesPerson: (id: string) =>
    [...depotPortalQueryKeys.all, "sales-person", id] as const,
  salesPersonCustomers: (id: string, params: DepotPortalQueryParams) =>
    [
      ...depotPortalQueryKeys.all,
      "sales-person",
      id,
      "customers",
      params,
    ] as const,
  salesPersonOrders: (id: string, params: DepotPortalQueryParams) =>
    [
      ...depotPortalQueryKeys.all,
      "sales-person",
      id,
      "orders",
      params,
    ] as const,
  customers: (params: DepotPortalQueryParams) =>
    [...depotPortalQueryKeys.all, "customers", params] as const,
  customer: (id: string) =>
    [...depotPortalQueryKeys.all, "customer", id] as const,
  customerOrders: (id: string, params: DepotPortalQueryParams) =>
    [...depotPortalQueryKeys.all, "customer", id, "orders", params] as const,
  orders: (params: DepotPortalQueryParams) =>
    [...depotPortalQueryKeys.all, "orders", params] as const,
  order: (id: string) => [...depotPortalQueryKeys.all, "order", id] as const,
  payments: (params: DepotPortalQueryParams) =>
    [...depotPortalQueryKeys.all, "payments", params] as const,
};

/**
 * Hook to fetch depot sales persons
 */
export const useDepotSalesPersons = (params: DepotPortalQueryParams = {}) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.salesPersons(params),
    queryFn: () => getDepotSalesPersons(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single depot sales person
 */
export const useDepotSalesPerson = (id: string) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.salesPerson(id),
    queryFn: () => getDepotSalesPerson(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch customers for a depot sales person
 */
export const useDepotSalesPersonCustomers = (
  id: string,
  params: DepotPortalQueryParams = {},
) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.salesPersonCustomers(id, params),
    queryFn: () => getDepotSalesPersonCustomers(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch orders for a depot sales person
 */
export const useDepotSalesPersonOrders = (
  id: string,
  params: DepotPortalQueryParams = {},
) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.salesPersonOrders(id, params),
    queryFn: () => getDepotSalesPersonOrders(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch depot customers
 */
export const useDepotCustomers = (params: DepotPortalQueryParams = {}) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.customers(params),
    queryFn: () => getDepotCustomers(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single depot customer
 */
export const useDepotCustomer = (id: string) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.customer(id),
    queryFn: () => getDepotCustomer(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch orders for a depot customer
 */
export const useDepotCustomerOrders = (
  id: string,
  params: DepotPortalQueryParams = {},
) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.customerOrders(id, params),
    queryFn: () => getDepotCustomerOrders(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch depot orders
 */
export const useDepotOrders = (params: DepotPortalQueryParams = {}) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.orders(params),
    queryFn: () => getDepotOrders(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single depot order
 */
export const useDepotOrder = (id: string) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.order(id),
    queryFn: () => getDepotOrder(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch depot payments
 */
export const useDepotPayments = (params: DepotPortalQueryParams = {}) => {
  return useQuery({
    queryKey: depotPortalQueryKeys.payments(params),
    queryFn: () => getDepotPayments(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to amend a depot order (update item quantities)
 */
export const useAmendDepotOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AmendOrderPayload }) =>
      amendDepotOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: depotPortalQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: depotPortalQueryKeys.order(variables.id),
      });
      toast.success("Order amended successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to amend order");
    },
  });
};
