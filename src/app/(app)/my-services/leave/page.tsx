"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MdVisibility, MdAdd } from "react-icons/md";

interface Leave {
  id: string;
  reason: string;
  reason_name: string;
  leave_start: string;
  leave_end: string;
  status: string;
  status_name: string;
  description: string;
}

// Dummy data
const DUMMY_LEAVES: Leave[] = [
  {
    id: "1",
    reason: "sick",
    reason_name: "Sick Leave",
    leave_start: "2026-04-10T00:00:00",
    leave_end: "2026-04-12T00:00:00",
    status: "pending",
    status_name: "Pending",
    description: "Not feeling well, need to rest",
  },
  {
    id: "2",
    reason: "annual",
    reason_name: "Annual Leave",
    leave_start: "2026-05-01T00:00:00",
    leave_end: "2026-05-07T00:00:00",
    status: "approved",
    status_name: "Approved",
    description: "Family vacation",
  },
  {
    id: "3",
    reason: "personal",
    reason_name: "Personal Leave",
    leave_start: "2026-03-15T00:00:00",
    leave_end: "2026-03-15T00:00:00",
    status: "rejected",
    status_name: "Rejected",
    description: "Personal matters to attend to",
  },
  {
    id: "4",
    reason: "sick",
    reason_name: "Sick Leave",
    leave_start: "2026-02-20T00:00:00",
    leave_end: "2026-02-22T00:00:00",
    status: "approved",
    status_name: "Approved",
    description: "Flu symptoms",
  },
];

const ITEMS_PER_PAGE = 3;

export default function MyLeavePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [leaves, setLeaves] = useState<Leave[]>(DUMMY_LEAVES);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination logic
  const totalPages = Math.ceil(leaves.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeaves = leaves.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewDetails = (leaveId: string) => {
    alert(`View leave application details: ${leaveId}`);
    // In a real app, you would navigate to the details page
    // window.location.href = `/my-services/leave/${leaveId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">My Leave Applications</h2>
              <p className="text-xs text-gray-500 mt-1">View and manage your leave requests</p>
            </div>
            <Link
              href="/my-services/leave/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MdAdd className="w-4 h-4" />
              Apply for Leave
            </Link>
          </div>

          {currentLeaves.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {leave.reason_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(leave.leave_start)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(leave.leave_end)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              leave.status
                            )}`}
                          >
                            {leave.status_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={leave.description}>
                            {leave.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewDetails(leave.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            <MdVisibility className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                No leave applications found
              </p>
              <Link
                href="/my-services/leave/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MdAdd className="w-4 h-4" />
                Apply for Leave
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {leaves.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Pending Applications</p>
              <p className="text-2xl font-bold text-yellow-600">
                {leaves.filter(l => l.status === "pending").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {leaves.filter(l => l.status === "approved").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {leaves.filter(l => l.status === "rejected").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}