import axiosInstance from "@/lib/axios";
import type {
  BackupListResponse,
  BackupRunResponse,
  BackupHealthResponse,
} from "@/types/backup";

// POST - Run a new backup
export const runBackup = async (): Promise<BackupRunResponse> => {
  const response = await axiosInstance.post<BackupRunResponse>("/backup/run");
  return response.data;
};

// GET - List all backups
export const getBackups = async (): Promise<BackupListResponse> => {
  const response = await axiosInstance.get<BackupListResponse>("/backup/list");
  return response.data;
};

// GET - Get backup health status
export const getBackupHealth = async (): Promise<BackupHealthResponse> => {
  const response =
    await axiosInstance.get<BackupHealthResponse>("/backup/health");
  return response.data;
};
