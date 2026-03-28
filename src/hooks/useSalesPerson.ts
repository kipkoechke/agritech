import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";
import {
  getSalesPersons,
  getSalesPerson,
  createSalesPerson,
  updateSalesPerson,
  deleteSalesPerson,
  getSalesPersonCustomers,
  getSalesPersonOrders,
  SalesPersonsParams,
  SalesPersonSubResourceParams,
} from "@/services/salesPersonService";
import type {
  CreateSalesPersonPayload,
  UpdateSalesPersonPayload,
} from "@/types/salesPerson";

// List hook with params
export const useSalesPersons = (params: SalesPersonsParams = {}) => {
  return useQuery({
    queryKey: ["sales-persons", params],
    queryFn: () => getSalesPersons(params),
  });
};

// Single item hook
export const useSalesPerson = (id: string) => {
  return useQuery({
    queryKey: ["sales-person", id],
    queryFn: () => getSalesPerson(id),
    enabled: !!id,
  });
};

// Create mutation with toast
export const useCreateSalesPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesPersonPayload) => createSalesPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-persons"] });
      toast.success("Sales representative created successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create sales representative"),
      );
    },
  });
};

// Update mutation with toast
export const useUpdateSalesPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSalesPersonPayload;
    }) => updateSalesPerson(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-persons"] });
      queryClient.invalidateQueries({
        queryKey: ["sales-person", variables.id],
      });
      toast.success("Sales representative updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update sales representative"),
      );
    },
  });
};

// Delete mutation with toast
export const useDeleteSalesPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSalesPerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-persons"] });
      toast.success("Sales representative deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to delete sales representative"),
      );
    },
  });
};

// Sales person customers hook (admin)
export const useSalesPersonCustomers = (
  id: string,
  params: SalesPersonSubResourceParams = {},
) => {
  return useQuery({
    queryKey: ["sales-person-customers", id, params],
    queryFn: () => getSalesPersonCustomers(id, params),
    enabled: !!id,
  });
};

// Sales person orders hook (admin)
export const useSalesPersonOrders = (
  id: string,
  params: SalesPersonSubResourceParams = {},
) => {
  return useQuery({
    queryKey: ["sales-person-orders", id, params],
    queryFn: () => getSalesPersonOrders(id, params),
    enabled: !!id,
  });
};
