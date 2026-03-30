"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack, MdEdit, MdCheckCircle } from "react-icons/md";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_time: string;
  assigned_by_user?: {
    name: string;
    email: string;
  };
  related_to?: string;
  related_id?: string;
  created_at: string;
  updated_at: string;
}

// Dummy data
const DUMMY_TASKS: Task[] = [
  {
    id: "1",
    title: "Complete weekly report",
    description: "Prepare and submit the weekly farm operations report including all metrics and KPIs",
    status: "pending",
    priority: "high",
    due_time: "2026-04-05T17:00:00",
    assigned_by_user: {
      name: "John Manager",
      email: "john.manager@farm.com",
    },
    created_at: "2026-03-28T09:00:00",
    updated_at: "2026-03-28T09:00:00",
  },
  {
    id: "2",
    title: "Inspect irrigation system",
    description: "Check all irrigation lines in section A and B for leaks and ensure proper water flow",
    status: "in_progress",
    priority: "urgent",
    due_time: "2026-04-03T16:00:00",
    assigned_by_user: {
      name: "Sarah Supervisor",
      email: "sarah.supervisor@farm.com",
    },
    related_to: "farm_section",
    related_id: "A-123",
    created_at: "2026-03-29T10:30:00",
    updated_at: "2026-04-01T14:20:00",
  },
  {
    id: "3",
    title: "Fertilizer application",
    description: "Apply organic fertilizer to tea plantation in section C and D",
    status: "completed",
    priority: "medium",
    due_time: "2026-03-30T14:00:00",
    assigned_by_user: {
      name: "Peter Coordinator",
      email: "peter.coordinator@farm.com",
    },
    related_to: "farm_section",
    related_id: "C-456",
    created_at: "2026-03-25T08:15:00",
    updated_at: "2026-03-30T15:00:00",
  },
];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundTask = DUMMY_TASKS.find(t => t.id === id);
      setTask(foundTask || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = () => {
    if (!task) return false;
    return new Date(task.due_time) < new Date() && task.status !== "completed";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
              <Link
                href="/my-services/tasks"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading task details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
              <Link
                href="/my-services/tasks"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Task not found
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
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Link
                href="/my-services/tasks"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
            </div>
            {task.status !== "completed" && (
              <div className="flex gap-2">
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
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Title and Description */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {task.title}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Status
                </label>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Priority
                </label>
                <div>
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

            {/* Due Date with Overdue Indicator */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                Due Date & Time
              </label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isOverdue() ? "bg-red-50" : "bg-gray-50"}`}>
                <span className={`font-medium ${isOverdue() ? "text-red-700" : "text-gray-900"}`}>
                  {formatDateTime(task.due_time)}
                </span>
                {isOverdue() && (
                  <span className="text-xs text-red-600 font-medium">(Overdue)</span>
                )}
              </div>
            </div>

            {/* Assigned By */}
            {task.assigned_by_user && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Assigned By
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900 font-medium">{task.assigned_by_user.name}</p>
                  <p className="text-sm text-gray-500">{task.assigned_by_user.email}</p>
                </div>
              </div>
            )}

            {/* Related Information */}
            {task.related_to && task.related_id && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Related To
                </label>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-900 font-medium">
                    {task.related_to.replace("_", " ").toUpperCase()} #{task.related_id}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-500 block mb-3">
                Timeline
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 w-24">Created:</span>
                  <span className="text-gray-900">{formatDateTime(task.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 w-24">Last Updated:</span>
                  <span className="text-gray-900">{formatDateTime(task.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}