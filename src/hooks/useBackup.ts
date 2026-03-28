import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getBackups,
  getBackupHealth,
  runBackup,
} from "@/services/backupService";

// List all backups
export const useBackups = () => {
  return useQuery({
    queryKey: ["backups"],
    queryFn: getBackups,
  });
};

// Get backup health
export const useBackupHealth = () => {
  return useQuery({
    queryKey: ["backup-health"],
    queryFn: getBackupHealth,
  });
};

// Run a new backup
export const useRunBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runBackup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      queryClient.invalidateQueries({ queryKey: ["backup-health"] });
      toast.success(data.message || "Backup completed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to run backup");
    },
  });
};
