"use client";

import React, { use } from "react";
import Link from "next/link";
import { useLeave } from "@/hooks/useLeaves";
import { MdArrowBack } from "react-icons/md";

export default function LeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: leave, isLoading } = useLeave(id);

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

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading leave details...
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Leave application not found
      </div>
    );
  }

  return (
    <div>
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

      <div className="p-6 space-y-4">
        {/* Status and Reason */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  leave.status
                )}`}
              >
                {leave.status_name || leave.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Reason</label>
            <p className="mt-1 text-gray-900">
              {leave.reason_name || leave.reason}
            </p>
          </div>
        </div>

        {/* Leave Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Start Date
            </label>
            <p className="mt-1 text-gray-900">
              {new Date(leave.leave_start).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              End Date
            </label>
            <p className="mt-1 text-gray-900">
              {new Date(leave.leave_end).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-500">
            Description
          </label>
          <p className="mt-1 text-gray-900 whitespace-pre-wrap">
            {leave.description}
          </p>
        </div>

        {/* Dates - Inline with vertical separators */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">Applied:</span>{" "}
              <span className="text-gray-900">
                {new Date(leave.created_at).toLocaleString()}
              </span>
            </div>
            {leave.updated_at && (
              <>
                <span className="text-gray-300">|</span>
                <div>
                  <span className="text-gray-500">Updated:</span>{" "}
                  <span className="text-gray-900">
                    {new Date(leave.updated_at).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
