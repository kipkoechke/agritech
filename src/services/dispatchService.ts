import axiosInstance from "@/lib/axios";
import type {
  Dispatch,
  DispatchesResponse,
  DispatchesQueryParams,
  CreateDispatchPayload,
} from "@/types/dispatch";

// Get all dispatches
export const getDispatches = async (
  params: DispatchesQueryParams = {},
): Promise<DispatchesResponse> => {
  const response = await axiosInstance.get<DispatchesResponse>("/dispatches", {
    params,
  });
  return response.data;
};

// Get single dispatch
export const getDispatch = async (id: string): Promise<Dispatch> => {
  const response = await axiosInstance.get<Dispatch>(`/dispatches/${id}`);
  return response.data;
};

// Create dispatch
export const createDispatch = async (
  data: CreateDispatchPayload,
): Promise<DispatchesResponse> => {
  const response = await axiosInstance.post<DispatchesResponse>(
    "/dispatches",
    data,
  );
  return response.data;
};
