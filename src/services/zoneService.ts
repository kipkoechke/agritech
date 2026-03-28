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
