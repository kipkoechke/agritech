"use client";

import React, { useState } from "react";
import { MdMoreVert, MdVisibility } from "react-icons/md";

interface DutyAssignment {
  id: string;
  duty_date: string;
  shift: string;
  assignment_status: string;
  instructions: string;
}

// Dummy data
const DUMMY_DUTIES: DutyAssignment[] = [
  {
    id: "1",
    duty_date: new Date().toISOString(),
    shift: "morning",
    assignment_status: "active",
    instructions: "Report to the main farm office by 7:00 AM",
  },
  {
    id: "2",
    duty_date: new Date(Date.now() + 86400000).toISOString(),
    shift: "afternoon",
    assignment_status: "scheduled",
    instructions: "Tea plucking in zone A, bring harvesting equipment",
  },
  {
    id: "3",
    duty_date: new Date(Date.now() - 86400000).toISOString(),
    shift: "morning",
    assignment_status: "completed",
    instructions: "Fertilizer application in section B",
  },
  {
    id: "4",
    duty_date: new Date(Date.now() - 172800000).toISOString(),
    shift: "night",
    assignment_status: "completed",
    instructions: "Irrigation system maintenance",
  },
  {
    id: "5",
    duty_date: new Date(Date.now() + 172800000).toISOString(),
    shift: "night",
    assignment_status: "scheduled",
    instructions: "Security patrol around the farm perimeter",
  },
];

export default function MyDutiesPage() {
  const [duties, setDuties] = useState<DutyAssignment[]>(DUMMY_DUTIES);
  const [isLoading, setIsLoading] = useState(false);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const handleViewDetails = (dutyId: string) => {
    alert(`View details for duty assignment: ${dutyId}`);
    // In a real app, you would navigate to the details page
    // window.location.href = `/my-services/duties/${dutyId}`;
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Duties</h1>
          <p className="text-gray-500 mt-1">View your assigned farm duties</p>
        </div>

        {duties.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {duties.map((duty) => (
                    <tr key={duty.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(duty.duty_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize bg-gray-100 text-gray-700">
                          {duty.shift}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            duty.assignment_status
                          )}`}
                        >
                          {duty.assignment_status.toUpperCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={duty.instructions}>
                          {duty.instructions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(duty.id)}
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
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No duty assignments</h3>
            <p className="text-gray-500">You don't have any duty assignments at the moment.</p>
          </div>
        )}

        {/* Quick Stats */}
        {duties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Active Duty</p>
              <p className="text-2xl font-bold text-gray-900">
                {duties.filter(d => d.assignment_status === "active").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {duties.filter(d => d.assignment_status === "scheduled").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {duties.filter(d => d.assignment_status === "completed").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}