import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

// Types
export interface AbstractType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  specialization: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cell {
  id: string;
  cell_number: string;
  cell_type: string;
  station_id: string;
  station?: {
    id: string;
    name: string;
  };
  capacity: number;
  current_occupancy?: number;
  gender_type: string;
  status: "active" | "inactive" | "maintenance";
  description?: string;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreateCellPayload {
  cell_number: string;
  cell_type: string;
  station_id: string;
  capacity: number;
  gender_type: string;
  status?: "active" | "inactive" | "maintenance";
  description?: string;
  metadata?: Record<string, string>;
}

export interface UpdateCellPayload {
  cell_number?: string;
  cell_type?: string;
  station_id?: string;
  capacity?: number;
  gender_type?: string;
  status?: "active" | "inactive" | "maintenance";
  description?: string;
  metadata?: Record<string, string>;
}

// API functions
const getAbstractTypes = async (): Promise<AbstractType[]> => {
  const response = await axiosInstance.get<{ data: AbstractType[] }>(
    "/abstract_types",
  );
  return response.data.data;
};

const getExpertProfiles = async (): Promise<ExpertProfile[]> => {
  const response = await axiosInstance.get<{ data: ExpertProfile[] }>(
    "/expert_profiles",
  );
  return response.data.data;
};

const getCells = async (): Promise<Cell[]> => {
  const response = await axiosInstance.get<{ data: Cell[] }>("/cells");
  return response.data.data;
};

const getCell = async (id: string): Promise<Cell> => {
  const response = await axiosInstance.get<{ data: Cell }>(`/cells/${id}`);
  return response.data.data;
};

const createCell = async (payload: CreateCellPayload): Promise<Cell> => {
  const response = await axiosInstance.post<{ data: Cell }>("/cells", payload);
  return response.data.data;
};

const updateCell = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateCellPayload;
}): Promise<Cell> => {
  const response = await axiosInstance.patch<{ data: Cell }>(
    `/cells/${id}`,
    data,
  );
  return response.data.data;
};

const deleteCell = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/cells/${id}`);
};

// Hooks
export const useAbstractTypes = () => {
  return useQuery({
    queryKey: ["abstract-types"],
    queryFn: getAbstractTypes,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExpertProfiles = () => {
  return useQuery({
    queryKey: ["expert-profiles"],
    queryFn: getExpertProfiles,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCells = () => {
  const query = useQuery({
    queryKey: ["cells"],
    queryFn: getCells,
    staleTime: 5 * 60 * 1000,
  });

  return {
    cells: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCell = (id: string) => {
  const query = useQuery({
    queryKey: ["cell", id],
    queryFn: () => getCell(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    cell: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCreateCell = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success("Cell created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create cell"));
    },
  });
};

export const useUpdateCell = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCell,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      queryClient.invalidateQueries({ queryKey: ["cell", data.id] });
      toast.success("Cell updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update cell"));
    },
  });
};

export const useDeleteCell = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success("Cell deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete cell"));
    },
  });
};
