"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdLocalActivity,
  MdEdit,
  MdInfo,
  MdStraighten,
} from "react-icons/md";
import { useActivity } from "@/hooks/useActivity";

const InfoCard = ({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon?: any;
  accent?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <div className="flex items-center gap-1.5">
      {Icon && (
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${accent ? "text-primary" : "text-gray-400"}`}
        />
      )}
      <span
        className={`text-sm font-medium ${accent ? "text-primary" : "text-gray-800"}`}
      >
        {value || "—"}
      </span>
    </div>
  </div>
);

export default function ActivityDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: activityResponse, isLoading } = useActivity(id);

  const activity = activityResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading activity details…</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Activity not found
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This activity doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/activities"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/activities"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-bold text-gray-900 truncate">
              {activity.name}
            </h1>
          </div>
          <Link
            href={`/activities/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdLocalActivity className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Activity Details
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard
              label="Name"
              value={activity.name}
              icon={MdLocalActivity}
            />
            <InfoCard
              label="Unit of Measure"
              value={activity.uom || "—"}
              icon={MdStraighten}
            />
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Status
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                  activity.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {activity.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
