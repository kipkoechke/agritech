"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MdVisibility, MdEdit, MdCheckCircle } from "react-icons/md";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_time: string;
  created_at: string;
}

// Dummy data
const DUMMY_TASKS: Task[] = [
  {
    id: "1",
    title: "Complete weekly report",
    description: "Prepare and submit the weekly farm operations report",
    status: "pending",
    priority: "high",
    due_time: "2026-04-05T17:00:00",
    created_at: "2026-03-28T09:00:00",
  },
  {
    id: "2",
    title: "Inspect irrigation system",
    description: "Check all irrigation lines and fix any leaks",
    status: "in_progress",
    priority: "urgent",
    due_time: "2026-04-03T16:00:00",
    created_at: "2026-03-29T10:30:00",
  },
  {
    id: "3",
    title: "Fertilizer application",
    description: "Apply organic fertilizer to section B and C",
    status: "pending",
    priority: "medium",
    due_time: "2026-04-04T14:00:00",
    created_at: "2026-03-30T08:15:00",
  },
  {
    id: "4",
    title: "Team meeting",
    description: "Weekly team sync to discuss progress and challenges",
    status: "completed",
    priority: "low",
    due_time: "2026-03-31T10:00:00",
    created_at: "2026-03-25T11:00:00",
  },
  {
    id: "5",
    title: "Order farm supplies",
    description: "Purchase seeds, fertilizers, and equipment for next season",
    status: "pending",
    priority: "high",
    due_time: "2026-04-06T15:00:00",
    created_at: "2026-04-01T09:45:00",
  },
  {
    id: "6",
    title: "Pest control",
    description: "Apply pest control measures in the tea plantation",
    status: "in_progress",
    priority: "urgent",
    due_time: "2026-04-02T12:00:00",
    created_at: "2026-03-31T14:20:00",
  },
];

const ITEMS_PER_PAGE = 5;

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(DUMMY_TASKS);
      setIsLoading(false);
    }, 500);
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTasks = tasks.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "IN PROGRESS";
      default:
        return status.toUpperCase();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-sm font-semibold text-gray-700">My Tasks</h2>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading tasks...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">My Tasks</h2>
              <p className="text-xs text-gray-500 mt-1">View and manage your assigned tasks</p>
            </div>
          </div>

          {tasks.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={task.description}>
                            {task.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {getStatusLabel(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isOverdue(task.due_time) && task.status !== "completed" ? "text-red-600 font-medium" : "text-gray-600"}`}>
                            {formatDate(task.due_time)}
                            {isOverdue(task.due_time) && task.status !== "completed" && (
                              <span className="ml-1 text-xs text-red-600">(Overdue)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/my-services/tasks/${task.id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Details"
                            >
                              <MdVisibility className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/my-services/tasks/${task.id}/update`}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Update Task"
                            >
                              <MdEdit className="w-5 h-5" />
                            </Link>
                            {task.status !== "completed" && (
                              <Link
                                href={`/my-services/tasks/${task.id}/complete`}
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                title="Complete Task"
                              >
                                <MdCheckCircle className="w-5 h-5" />
                              </Link>
                            )}
                          </div>
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

              {/* Task Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-t border-gray-200 bg-gray-50">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {tasks.filter(t => t.status === "pending").length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === "in_progress").length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === "completed").length}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No tasks assigned to you</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}