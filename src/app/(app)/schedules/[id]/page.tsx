"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MdArrowBack, MdSchedule, MdCancel } from "react-icons/md";
import Button from "@/components/common/Button";
import { useSchedule, useCancelSchedule } from "@/hooks/useSchedule";

export default function ScheduleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading } = useSchedule(id);
  const cancelSchedule = useCancelSchedule();

  const schedule = scheduleResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Schedule not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/schedules"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Schedules
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdSchedule className="w-6 h-6 text-emerald-600" />
                  {schedule.reference_code}
                </h1>
                <p className="text-gray-500 mt-1">Schedule Details</p>
              </div>
              <div className="flex gap-2">
                {schedule.status !== "cancelled" && (
                  <button
                    onClick={() => cancelSchedule.mutate(id)}
                    disabled={cancelSchedule.isPending}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50"
                  >
                    <MdCancel className="w-4 h-4" />
                    {cancelSchedule.isPending ? "Cancelling..." : "Cancel"}
                  </button>
                )}
                <Button type="small" to={`/schedules/${id}/edit`}>
                  Edit
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Reference Code
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {schedule.reference_code}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </p>
                <span
                  className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                    schedule.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {schedule.status.charAt(0).toUpperCase() +
                    schedule.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Activity
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {schedule.activity.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Farm
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {schedule.farm.name}
                </p>
                <p className="text-xs text-gray-400">
                  {schedule.farm.zone.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(schedule.scheduled_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Created By
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {schedule.created_by.name}
                </p>
              </div>

              {schedule.notes && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Notes
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {schedule.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Created At
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(schedule.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
