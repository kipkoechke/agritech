"use client";

import React from "react";
import { useDutyAssignments } from "@/hooks/useDutyAssignments";
import { ActionMenu } from "@/components/common/ActionMenu";
import { MdMoreVert, MdVisibility } from "react-icons/md";
import type { DutyAssignment } from "@/services/dutyAssignmentsService";

export default function MyDutiesPage() {
  const { data: dutiesData, isLoading: dutiesLoading } = useDutyAssignments();
  const duties = dutiesData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {dutiesLoading ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Loading duty assignments...
        </div>
      ) : duties.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructions
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {duties.map((duty: DutyAssignment) => (
                <tr
                  key={duty.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(duty.duty_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    <span className="capitalize">{duty.shift}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        duty.assignment_status
                      )}`}
                    >
                      {duty.assignment_status.toUpperCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {duty.instructions}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <ActionMenu menuId={`duty-menu-${duty.id}`}>
                      <ActionMenu.Trigger>
                        <MdMoreVert className="w-5 h-5 text-gray-600" />
                      </ActionMenu.Trigger>
                      <ActionMenu.Content>
                        <ActionMenu.Item
                          onClick={() =>
                            (window.location.href = `/my-services/duties/${duty.id}`)
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
      ) : (
        <div className="p-8 text-center text-gray-500 text-sm">
          No duty assignments found
        </div>
      )}
    </div>
  );
}
