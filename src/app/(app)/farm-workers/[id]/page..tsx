"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdPerson,
  MdPhone,
  MdPin,
  MdLocationOn,
  MdCalendarToday,
  MdBadge,
} from "react-icons/md";
import { useWorker, useDeleteWorker } from "@/hooks/useWorkers";

export default function WorkerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: workerResponse, isLoading } = useWorker(id);
  const deleteWorker = useDeleteWorker();

  const worker = workerResponse?.data;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this farm worker?")) {
      await deleteWorker.mutateAsync(id);
      router.push("/farm-workers");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Farm worker not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4">
        <Link
          href="/farm-workers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farm Workers
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MdPerson className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-gray-900">{worker.name}</h1>
                </div>
                <p className="text-gray-500 text-sm">Worker ID: {worker.id}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/farm-workers/${worker.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MdEdit className="w-5 h-5" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteWorker.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <MdDelete className="w-5 h-5" />
                  {deleteWorker.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                
                <div className="flex items-start gap-3">
                  <MdPerson className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-gray-900 font-medium">{worker.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MdPhone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-900 font-medium">{worker.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MdPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">PIN</p>
                    <p className="text-gray-900 font-medium">••••</p>
                    <p className="text-xs text-gray-400 mt-1">PIN is hidden for security</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Assignment Information</h3>
                
                <div className="flex items-start gap-3">
                  <MdLocationOn className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Zone</p>
                    <p className="text-gray-900 font-medium">{worker.zone?.name || "Not assigned"}</p>
                    {worker.zone?.id && (
                      <p className="text-xs text-gray-400 mt-1">Zone ID: {worker.zone.id}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MdBadge className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-gray-900 font-medium">Field Worker</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worker.created_at && (
                  <div className="flex items-start gap-3">
                    <MdCalendarToday className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(worker.created_at).toLocaleDateString()} at {new Date(worker.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {worker.updated_at && worker.updated_at !== worker.created_at && (
                  <div className="flex items-start gap-3">
                    <MdCalendarToday className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(worker.updated_at).toLocaleDateString()} at {new Date(worker.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}