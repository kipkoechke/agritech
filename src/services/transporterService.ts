import axiosInstance from "@/lib/axios";
import type {
  Transporter,
  TransportersResponse,
  CreateTransporterPayload,
  UpdateTransporterPayload,
} from "@/types/transporter";

export interface TransportersParams {
  page?: number;
  per_page?: number;
  search?: string;
  region_id?: string;
}

// GET all transporters (with pagination & filters)
export const getTransporters = async (
  params: TransportersParams = {},
): Promise<TransportersResponse> => {
  const response = await axiosInstance.get("/transporters", { params });
  return response.data;
};

// GET single transporter by ID
export const getTransporter = async (id: string): Promise<Transporter> => {
  const response = await axiosInstance.get(`/transporters/${id}`);
  return response.data.data || response.data;
};

// POST create transporter
export const createTransporter = async (
  data: CreateTransporterPayload,
): Promise<Transporter> => {
  const response = await axiosInstance.post("/transporters", data);
  return response.data.data || response.data;
};

// PATCH update transporter
export const updateTransporter = async (
  id: string,
  data: UpdateTransporterPayload,
): Promise<Transporter> => {
  const response = await axiosInstance.patch(`/transporters/${id}`, data);
  return response.data.data || response.data;
};

// DELETE transporter
export const deleteTransporter = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/transporters/${id}`);
};
