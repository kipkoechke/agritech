import axiosInstance from "../lib/axios";

export interface Farm {
  id: string;
  name: string;
  size: number;
  coordinates?: Record<string, unknown>;
  zone_id?: string;
  product_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFarmData {
  name: string;
  size: number;
  coordinates?: Record<string, unknown>;
  zone_id?: string;
  product_id?: string;
}

export interface UpdateFarmData {
  name?: string;
  size?: number;
  coordinates?: Record<string, unknown>;
  zone_id?: string;
  product_id?: string;
}

const farmService = {
  getAll: async (): Promise<Farm[]> => {
    const response = await axiosInstance.get<{ data: Farm[] }>("/farms");
    return response.data.data;
  },

  getById: async (id: string): Promise<Farm> => {
    const response = await axiosInstance.get<{ data: Farm }>(`/farms/${id}`);
    return response.data.data;
  },

  create: async (data: CreateFarmData): Promise<Farm> => {
    const response = await axiosInstance.post<{ data: Farm }>("/farms", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateFarmData): Promise<Farm> => {
    const response = await axiosInstance.put<{ data: Farm }>(`/farms/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/farms/${id}`);
  },
};

export default farmService;
