"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMyLeavesPaginated } from "@/hooks/useLeaves";
import { ActionMenu } from "@/components/common/ActionMenu";
import { MdMoreVert, MdVisibility, MdAdd } from "react-icons/md";
import type { Leave } from "@/types/leaves";

export default function MyLeavePage() {
  const [leavesPage, setLeavesPage] = useState(1);
  const { data: leavesData, isLoading: leavesLoading } =
    useMyLeavesPaginated(leavesPage);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">
          My Leave Applications
        </h2>
        <Link
          href="/my-services/leave/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          <MdAdd className="w-4 h-4" />
          Apply for Leave
        </Link>
      </div>
      {leavesLoading ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Loading leave applications...
        </div>
      ) : leavesData?.data && leavesData.data.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leavesData.data.map((leave: Leave) => (
                  <tr
                    key={leave.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {leave.reason_name || leave.reason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(leave.leave_start).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(leave.leave_end).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          leave.status.toLowerCase()
                        )}`}
                      >
                        {leave.status_name || leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {leave.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu menuId={`leave-menu-${leave.id}`}>
                        <ActionMenu.Trigger>
                          <MdMoreVert className="w-5 h-5 text-gray-600" />
                        </ActionMenu.Trigger>
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() =>
                              (window.location.href = `/my-services/leave/${leave.id}`)
                            }
                          >
                            <MdVisibility className="w-4 h-4" />
                            View Details
                          </ActionMenu.Item>
                        </ActionMenu.Content>
                      </ActionMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {leavesData.pagination && leavesData.pagination.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Page {leavesData.pagination.current_page} of{" "}
                {leavesData.pagination.last_page}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLeavesPage((prev) => Math.max(1, prev - 1))}
                  disabled={leavesPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setLeavesPage((prev) =>
                      Math.min(leavesData.pagination!.last_page, prev + 1)
                    )
                  }
                  disabled={leavesPage === leavesData.pagination.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            No leave applications found
          </p>
          <Link
            href="/my-services/leave/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            <MdAdd className="w-4 h-4" />
            Apply for Leave
          </Link>
        </div>
      )}
    </div>
  );
}
