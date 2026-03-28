// Backup types

export interface BackupItem {
  filename: string;
  date: string;
  age: string;
  size: string;
  size_in_bytes: number;
  download_url: string;
}

export interface BackupListResponse {
  success: boolean;
  backups: BackupItem[];
  total_count: number;
  total_size: string;
  total_size_in_bytes: number;
  disk: string;
}

export interface BackupRunResponse {
  success: boolean;
  message: string;
  output: string;
}

export interface BackupHealthCheck {
  name: string;
  healthy: boolean;
  message: string;
}

export interface BackupHealthResponse {
  success: boolean;
  health: "healthy" | "unhealthy";
  backup_count: number;
  newest_backup: {
    filename: string;
    date: string;
    age: string;
    size: string;
  };
  oldest_backup: {
    filename: string;
    date: string;
    age: string;
  };
  total_storage_used: string;
  disk: string;
  health_checks: BackupHealthCheck[];
}
