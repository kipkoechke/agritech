"use client";

import React, { use } from "react";
import Link from "next/link";
import { useDutyAssignment } from "@/hooks/useDutyAssignments";
import { MdArrowBack } from "react-icons/md";

export default function DutyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: dutyData, isLoading } = useDutyAssignment(id);
  const duty = dutyData?.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"; 
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "morning":
        return "bg-yellow-100 text-yellow-800";
      case "afternoon":
        return "bg-orange-100 text-orange-800";
      case "night":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading duty assignment details...
      </div>
    );
  }

  if (!duty) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Duty assignment not found
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
        <Link
          href="/my-services/duties"
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdArrowBack className="w-5 h-5 text-gray-600" />
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">
          Duty Assignment Details
        </h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Status and Shift */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  duty.assignment_status
                )}`}
              >
                {duty.assignment_status.toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Shift</label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getShiftColor(
                  duty.shift
                )}`}
              >
                {duty.shift.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Duty Date */}
        <div>
          <label className="text-sm font-medium text-gray-500">Duty Date</label>
          <p className="mt-1 text-gray-900">
            {new Date(duty.duty_date).toLocaleDateString()}
          </p>
        </div>

        {/* Instructions */}
        <div>
          <label className="text-sm font-medium text-gray-500">
            Instructions
          </label>
          <p className="mt-1 text-gray-900 whitespace-pre-wrap">
            {duty.instructions}
          </p>
        </div>

        {/* Related Task */}
        {duty.task_id && (
          <div>
            <label className="text-sm font-medium text-gray-500">
              Related Task
            </label>
            <p className="mt-1 text-gray-900">Task #{duty.task_id}</p>
          </div>
        )}

        {/* Attendance */}
        {duty.attendance && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Attendance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Check In
                </label>
                <p className="mt-1 text-gray-900">
                  {duty.attendance.clock_in_at
                    ? new Date(duty.attendance.clock_in_at).toLocaleString()
                    : "Not checked in"}
                </p>
                {duty.attendance.is_clocked_in && (
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Currently Clocked In
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Check Out
                </label>
                <p className="mt-1 text-gray-900">
                  {duty.attendance.clock_out_at
                    ? new Date(duty.attendance.clock_out_at).toLocaleString()
                    : "Not checked out"}
                </p>
              </div>
            </div>
            
            {/* Check In Location */}
            {duty.attendance.clock_in_location && (
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-500">
                  Check In Location
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  {duty.attendance.clock_in_location.address}
                </p>
              </div>
            )}

            {/* Check Out Location */}
            {duty.attendance.clock_out_location && (
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-500">
                  Check Out Location
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  {duty.attendance.clock_out_location.address}
                </p>
              </div>
            )}

            {/* Attendance Notes */}
            {duty.attendance.notes && (
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-500">
                  Attendance Notes
                </label>
                <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {duty.attendance.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* User Info */}
        {duty.user && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Assigned Officer
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="mt-1 text-gray-900">{duty.user.name}</p>
              </div>
              {duty.user.rank && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rank
                  </label>
                  <p className="mt-1 text-gray-900">{duty.user.rank}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1 text-gray-900">{duty.user.email}</p>
              </div>
              {duty.user.check_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Check Number
                  </label>
                  <p className="mt-1 text-gray-900">{duty.user.check_number}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Station Info */}
        {duty.station && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Station
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="mt-1 text-gray-900">{duty.station.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Code
                </label>
                <p className="mt-1 text-gray-900">{duty.station.code}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
            <div>
              <span className="text-gray-500">Created:</span>{" "}
              <span className="text-gray-900">
                {new Date(duty.created_at).toLocaleString()}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-gray-500">Updated:</span>{" "}
              <span className="text-gray-900">
                {new Date(duty.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}