"use client";

import React, { use } from "react";
import Link from "next/link";
import { useTask } from "@/hooks/useTasks";
import { MdArrowBack, MdEdit, MdCheckCircle } from "react-icons/md";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: taskData, isLoading } = useTask(id);
  const task = taskData?.data;

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

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading task details...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Task not found
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <Link
            href="/my-services/tasks"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdArrowBack className="w-5 h-5 text-gray-600" />
          </Link>
          <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
        </div>
        <div className="flex gap-2">
          {task.status !== "completed" && (
            <>
              <Link
                href={`/my-services/tasks/${id}/update`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MdEdit className="w-4 h-4" />
                Update
              </Link>
              <Link
                href={`/my-services/tasks/${id}/complete`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <MdCheckCircle className="w-4 h-4" />
                Complete
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {task.title}
          </h3>
          <p className="text-gray-600">{task.description}</p>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Priority
            </label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned By */}
        {task.assigned_by_user && (
          <div>
            <label className="text-sm font-medium text-gray-500">
              Assigned By
            </label>
            <p className="mt-1 text-gray-900">{task.assigned_by_user.name}</p>
            <p className="text-sm text-gray-500">
              {task.assigned_by_user.email}
            </p>
          </div>
        )}

        {/* Related Information */}
        {task.related_to && task.related_id && (
          <div>
            <label className="text-sm font-medium text-gray-500">
              Related To
            </label>
            <p className="mt-1 text-gray-900">
              {task.related_to.replace("_", " ").toUpperCase()} #
              {task.related_id}
            </p>
          </div>
        )}

        {/* Dates - Inline with vertical separators */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">Due:</span>{" "}
              <span className="text-gray-900">
                {new Date(task.due_time).toLocaleString()}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-gray-500">Created:</span>{" "}
              <span className="text-gray-900">
                {new Date(task.created_at).toLocaleString()}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-gray-500">Updated:</span>{" "}
              <span className="text-gray-900">
                {new Date(task.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
