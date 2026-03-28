import axiosInstance from "@/lib/axios";
import { Rank, RanksResponse } from "@/types/rank";

export const getRanks = async (): Promise<RanksResponse> => {
  const response = await axiosInstance.get<RanksResponse>("/ranks");
  return response.data;
};

export const getRank = async (id: string): Promise<Rank> => {
  const response = await axiosInstance.get<{ data: Rank }>(`/ranks/${id}`);
  return response.data.data;
};

export const createRank = async (payload: {
  name: string;
  description: string;
}): Promise<Rank> => {
  const response = await axiosInstance.post<{ data: Rank }>("/ranks", payload);
  return response.data.data;
};

export const updateRank = async (
  id: string,
  payload: { name: string; description: string },
): Promise<Rank> => {
  const response = await axiosInstance.put<{ data: Rank }>(
    `/ranks/${id}`,
    payload,
  );
  return response.data.data;
};

export const deleteRank = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/ranks/${id}`);
};
