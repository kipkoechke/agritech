import axiosInstance from "@/lib/axios";
import type { Zone } from "@/types/zone";

export const getZones = async (): Promise<Zone[]> => {
  const response = await axiosInstance.get<{ data: Zone[] }>("/zones");
  return response.data.data;
};

export const getZone = async (id: string): Promise<Zone> => {
  const response = await axiosInstance.get<{ data: Zone }>(`/zones/${id}`);
  return response.data.data;
};

export const createZone = async (name: string): Promise<Zone> => {
  const response = await axiosInstance.post<{ data: Zone }>("/zones", { name });
  return response.data.data;
};

export const updateZone = async (id: string, name: string): Promise<Zone> => {
  const response = await axiosInstance.put<{ data: Zone }>(`/zones/${id}`, { name });
  return response.data.data;
};

export const deleteZone = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/zones/${id}`);
};