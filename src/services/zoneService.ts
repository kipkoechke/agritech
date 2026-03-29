import axiosInstance from "@/lib/axios";
import type { Zone } from "@/types/zone";

export const getZones = async (): Promise<Zone[]> => {
  const response = await axiosInstance.get<Zone[] | { data: Zone[] }>("/zones");
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data || [];
};

export const getZone = async (id: string): Promise<Zone> => {
  const response = await axiosInstance.get<Zone>(`/zones/${id}`);
  return response.data;
};

export const createZone = async (name: string): Promise<Zone> => {
  const response = await axiosInstance.post<Zone>("/zones", { name });
  return response.data;
};

export const updateZone = async (id: string, name: string): Promise<Zone> => {
  const response = await axiosInstance.put<Zone>(`/zones/${id}`, { name });
  return response.data;
};

export const deleteZone = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/zones/${id}`);
};