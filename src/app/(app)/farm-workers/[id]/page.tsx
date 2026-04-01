"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MdArrowBack, MdPerson, MdCalendarToday } from "react-icons/md";
import Button from "@/components/common/Button";
import { useWorker } from "@/hooks/useWorkers";

export default function WorkerDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workerResponse, isLoading } = useWorker(id);

  const worker = workerResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Worker not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/farm-workers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farm Workers
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdPerson className="w-6 h-6 text-emerald-600" />
                  {worker.name}
                </h1>
                <p className="text-gray-500 mt-1">Worker Details</p>
              </div>
              <Button type="small" to={`/farm-workers/${id}/edit`}>
                Edit
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Name
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {worker.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {worker.phone}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Zone
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {worker.zone?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Factory
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {worker.factory?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Cluster
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {worker.cluster?.name || "—"}
                </p>
              </div>

              {worker.created_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <MdCalendarToday className="w-3 h-3" />
                    Created
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(worker.created_at).toLocaleDateString()} at{" "}
                    {new Date(worker.created_at).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {worker.updated_at &&
                worker.updated_at !== worker.created_at && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <MdCalendarToday className="w-3 h-3" />
                      Last Updated
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(worker.updated_at).toLocaleDateString()} at{" "}
                      {new Date(worker.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
