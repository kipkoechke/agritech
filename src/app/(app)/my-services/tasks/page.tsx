"use client";

import React, { useState } from "react";
import { useMyTasks } from "@/hooks/useTasks";
import { ActionMenu } from "@/components/common/ActionMenu";
import {
  MdMoreVert,
  MdVisibility,
  MdEdit,
  MdCheckCircle,
} from "react-icons/md";
import type { Task } from "@/services/tasksService";

export default function MyTasksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: tasksData, isLoading: tasksLoading } = useMyTasks(
    currentPage,
    15
  );

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

  return (
    <div>
      {tasksLoading ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Loading tasks...
        </div>
      ) : tasksData?.data && tasksData.data.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasksData.data.map((task: Task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {task.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(task.due_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu menuId={`task-menu-${task.id}`}>
                        <ActionMenu.Trigger>
                          <MdMoreVert className="w-5 h-5 text-gray-600" />
                        </ActionMenu.Trigger>
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() =>
                              (window.location.href = `/my-services/tasks/${task.id}`)
                            }
                          >
                            <MdVisibility className="w-4 h-4" />
                            View Details
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() =>
                              (window.location.href = `/my-services/tasks/${task.id}/update`)
                            }
                          >
                            <MdEdit className="w-4 h-4" />
                            Update Task
                          </ActionMenu.Item>
                          {task.status !== "completed" && (
                            <ActionMenu.Item
                              onClick={() =>
                                (window.location.href = `/my-services/tasks/${task.id}/complete`)
                              }
                            >
                              <MdCheckCircle className="w-4 h-4" />
                              Complete Task
                            </ActionMenu.Item>
                          )}
                        </ActionMenu.Content>
                      </ActionMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {tasksData.pagination && tasksData.pagination.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Page {tasksData.pagination.current_page} of{" "}
                {tasksData.pagination.last_page}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(tasksData.pagination!.last_page, prev + 1)
                    )
                  }
                  disabled={currentPage === tasksData.pagination.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-gray-500 text-sm">
          No tasks assigned to you
        </div>
      )}
    </div>
  );
}
