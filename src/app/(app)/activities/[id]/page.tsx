"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MdArrowBack, MdLocalActivity } from "react-icons/md";
import Button from "@/components/common/Button";
import { useActivity } from "@/hooks/useActivity";

export default function ActivityDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: activityResponse, isLoading } = useActivity(id);

  const activity = activityResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Activity not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Activities
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdLocalActivity className="w-6 h-6 text-emerald-600" />
                  {activity.name}
                </h1>
                <p className="text-gray-500 mt-1">Activity Details</p>
              </div>
              <Button type="small" to={`/activities/${id}/edit`}>
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
                  {activity.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Unit of Measure
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {activity.uom}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </p>
                <span
                  className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                    activity.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {activity.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
