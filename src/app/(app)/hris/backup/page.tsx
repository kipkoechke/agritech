"use client";

import React, { useState } from "react";
import { HRISLayout } from "@/components/hris";
import { useBackups, useBackupHealth, useRunBackup } from "@/hooks/useBackup";
import {
  MdBackup,
  MdCloudDownload,
  MdCheckCircle,
  MdError,
  MdStorage,
  MdSchedule,
  MdFolder,
  MdPlayArrow,
  MdHealthAndSafety,
  MdRefresh,
} from "react-icons/md";
import type { BackupItem } from "@/types/backup";

export default function BackupPage() {
  const { data: backupsData, isLoading: backupsLoading } = useBackups();
  const { data: healthData, isLoading: healthLoading } = useBackupHealth();
  const runBackupMutation = useRunBackup();
  const [expandedOutput, setExpandedOutput] = useState(false);

  const handleRunBackup = () => {
    runBackupMutation.mutate();
  };

  const handleDownload = (backup: BackupItem) => {
    window.open(backup.download_url, "_blank");
  };

  const isHealthy = healthData?.health === "healthy";

  return (
    <HRISLayout
      title="Backup Management"
      description="Manage database backups and monitor system health"
      action={
        <button
          onClick={handleRunBackup}
          disabled={runBackupMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {runBackupMutation.isPending ? (
            <>
              <MdRefresh className="w-4 h-4 animate-spin" />
              Running Backup...
            </>
          ) : (
            <>
              <MdPlayArrow className="w-4 h-4" />
              Run Backup
            </>
          )}
        </button>
      }
    >
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Backup Output (shown after running) */}
        {runBackupMutation.isSuccess && runBackupMutation.data?.output && (
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MdCheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Backup Output
                </span>
              </div>
              <button
                onClick={() => setExpandedOutput(!expandedOutput)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                {expandedOutput ? "Collapse" : "Expand"}
              </button>
            </div>
            <pre
              className={`text-xs text-slate-300 font-mono whitespace-pre-wrap ${
                !expandedOutput ? "max-h-24 overflow-hidden" : ""
              }`}
            >
              {runBackupMutation.data.output}
            </pre>
          </div>
        )}

        {/* Health & Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Health Status */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                healthLoading
                  ? "bg-slate-100"
                  : isHealthy
                    ? "bg-emerald-50"
                    : "bg-red-50"
              }`}
            >
              <MdHealthAndSafety
                className={`w-5 h-5 ${
                  healthLoading
                    ? "text-slate-400"
                    : isHealthy
                      ? "text-emerald-600"
                      : "text-red-600"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Health Status</p>
              {healthLoading ? (
                <div className="w-16 h-5 bg-slate-100 animate-pulse rounded mt-0.5" />
              ) : (
                <p
                  className={`text-sm font-semibold capitalize ${
                    isHealthy ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {healthData?.health || "Unknown"}
                </p>
              )}
            </div>
          </div>

          {/* Total Backups */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MdBackup className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Total Backups</p>
              {healthLoading ? (
                <div className="w-10 h-5 bg-slate-100 animate-pulse rounded mt-0.5" />
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {healthData?.backup_count ?? backupsData?.total_count ?? 0}
                </p>
              )}
            </div>
          </div>

          {/* Storage Used */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <MdStorage className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Storage Used</p>
              {healthLoading ? (
                <div className="w-20 h-5 bg-slate-100 animate-pulse rounded mt-0.5" />
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {healthData?.total_storage_used ||
                    backupsData?.total_size ||
                    "0 KB"}
                </p>
              )}
            </div>
          </div>

          {/* Newest Backup */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <MdSchedule className="w-5 h-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Latest Backup</p>
              {healthLoading ? (
                <div className="w-20 h-5 bg-slate-100 animate-pulse rounded mt-0.5" />
              ) : (
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {healthData?.newest_backup?.age || "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Health Checks */}
        {healthData?.health_checks && healthData.health_checks.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Health Checks
            </h3>
            <div className="space-y-2">
              {healthData.health_checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/50"
                >
                  {check.healthy ? (
                    <MdCheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <MdError className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {check.name.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-xs text-slate-500">{check.message}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      check.healthy
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {check.healthy ? "Passed" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup List */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Backup History
            </h3>
            {backupsData && (
              <span className="text-xs text-slate-400">
                {backupsData.total_count} backup
                {backupsData.total_count !== 1 ? "s" : ""} &middot;{" "}
                {backupsData.total_size} total
              </span>
            )}
          </div>

          {backupsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50"
                >
                  <div className="w-9 h-9 bg-slate-100 animate-pulse rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-4 bg-slate-100 animate-pulse rounded" />
                    <div className="w-32 h-3 bg-slate-100 animate-pulse rounded" />
                  </div>
                  <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
          ) : !backupsData?.backups?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MdFolder className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No backups found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Run a backup to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {backupsData.backups.map((backup, index) => (
                <div
                  key={backup.filename}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <MdBackup className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {backup.filename}
                      </p>
                      {index === 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">
                        {new Date(backup.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-xs text-slate-300">&middot;</span>
                      <span className="text-xs text-slate-400">
                        {backup.age}
                      </span>
                      <span className="text-xs text-slate-300">&middot;</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {backup.size}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(backup)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                  >
                    <MdCloudDownload className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HRISLayout>
  );
}
