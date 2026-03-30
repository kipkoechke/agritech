"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

interface Leave {
  id: string;
  reason: string;
  reason_name: string;
  leave_start: string;
  leave_end: string;
  status: string;
  status_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Dummy data
const DUMMY_LEAVES: Leave[] = [
  {
    id: "1",
    reason: "sick",
    reason_name: "Sick Leave",
    leave_start: "2026-04-10T08:00:00",
    leave_end: "2026-04-12T17:00:00",
    status: "pending",
    status_name: "Pending",
    description: "Not feeling well, need to rest and recover from fever",
    created_at: "2026-04-01T10:30:00",
    updated_at: "2026-04-01T10:30:00",
  },
  {
    id: "2",
    reason: "annual",
    reason_name: "Annual Leave",
    leave_start: "2026-05-01T09:00:00",
    leave_end: "2026-05-07T17:00:00",
    status: "approved",
    status_name: "Approved",
    description: "Family vacation to the coast. Planning to visit Mombasa and Diani beach.",
    created_at: "2026-03-15T14:20:00",
    updated_at: "2026-03-20T09:15:00",
  },
  {
    id: "3",
    reason: "personal",
    reason_name: "Personal Leave",
    leave_start: "2026-03-15T08:00:00",
    leave_end: "2026-03-15T17:00:00",
    status: "rejected",
    status_name: "Rejected",
    description: "Need to attend to urgent personal matters at home",
    created_at: "2026-03-10T11:45:00",
    updated_at: "2026-03-12T16:30:00",
  },
];

export default function LeaveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [leave, setLeave] = useState<Leave | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundLeave = DUMMY_LEAVES.find(l => l.id === id);
      setLeave(foundLeave || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <Link
                href="/my-services/leave"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Application Details
              </h2>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading leave details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <Link
                href="/my-services/leave"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Application Details
              </h2>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Leave application not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
            <Link
              href="/my-services/leave"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <MdArrowBack className="w-5 h-5 text-gray-600" />
            </Link>
            <h2 className="text-lg font-semibold text-gray-900">
              Leave Application Details
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Status and Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Status
                </label>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      leave.status
                    )}`}
                  >
                    {leave.status_name}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Reason
                </label>
                <p className="text-gray-900 font-medium">
                  {leave.reason_name}
                </p>
              </div>
            </div>

            {/* Leave Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Start Date & Time
                </label>
                <p className="text-gray-900">
                  {formatDateTime(leave.leave_start)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  End Date & Time
                </label>
                <p className="text-gray-900">
                  {formatDateTime(leave.leave_end)}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">
                Duration
              </label>
              <p className="text-gray-900 font-medium">
                {Math.ceil(
                  (new Date(leave.leave_end).getTime() - new Date(leave.leave_start).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                day(s)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                Description
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {leave.description}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">Applied:</span>{" "}
                  <span className="text-gray-900">
                    {formatDateTime(leave.created_at)}
                  </span>
                </div>
                {leave.updated_at && leave.updated_at !== leave.created_at && (
                  <>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>{" "}
                      <span className="text-gray-900">
                        {formatDateTime(leave.updated_at)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {leave.status === "pending" && (
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => alert("Edit functionality would open here")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit Request
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this leave request?")) {
                      alert("Leave request cancelled");
                      router.push("/my-services/leave");
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}