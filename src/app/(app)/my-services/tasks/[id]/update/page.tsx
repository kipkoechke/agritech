"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

interface UpdateTaskFormData {
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_time: string;
}

// Dummy data for tasks
const DUMMY_TASKS = [
  {
    id: "1",
    title: "Complete weekly report",
    description: "Prepare and submit the weekly farm operations report",
    status: "pending",
    priority: "high",
    due_time: "2026-04-05T17:00:00",
    created_at: "2026-03-28T09:00:00",
    updated_at: "2026-03-28T09:00:00",
  },
  {
    id: "2",
    title: "Inspect irrigation system",
    description: "Check all irrigation lines and fix any leaks",
    status: "in_progress",
    priority: "urgent",
    due_time: "2026-04-03T16:00:00",
    created_at: "2026-03-29T10:30:00",
    updated_at: "2026-04-01T14:20:00",
  },
  {
    id: "3",
    title: "Fertilizer application",
    description: "Apply organic fertilizer to section B and C",
    status: "completed",
    priority: "medium",
    due_time: "2026-03-30T14:00:00",
    created_at: "2026-03-25T08:15:00",
    updated_at: "2026-03-30T15:00:00",
  },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function UpdateTaskPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateTaskFormData>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_time: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateTaskFormData, string>>>({});

  useEffect(() => {
    // Simulate API call to fetch task
    setTimeout(() => {
      const task = DUMMY_TASKS.find(t => t.id === id);
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          status: task.status as any,
          priority: task.priority as any,
          due_time: new Date(task.due_time).toISOString().slice(0, 16),
        });
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UpdateTaskFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
    }
    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }
    if (!formData.due_time) {
      newErrors.due_time = "Due date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof UpdateTaskFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to update task
    setTimeout(() => {
      // In a real app, you would update the task in your state management
      console.log("Task updated:", { id, ...formData });
      
      setIsSubmitting(false);
      alert("Task updated successfully!");
      router.push(`/my-services/tasks/${id}`);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
              <Link
                href={`/my-services/tasks/${id}`}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">Update Task</h2>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
            <Link
              href={`/my-services/tasks/${id}`}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <MdArrowBack className="w-5 h-5 text-gray-600" />
            </Link>
            <h2 className="text-lg font-semibold text-gray-900">Update Task</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter task description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                      errors.status ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs text-red-600">{errors.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                      errors.priority ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-xs text-red-600">{errors.priority}</p>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="due_time"
                  value={formData.due_time}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                    errors.due_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.due_time && (
                  <p className="mt-1 text-xs text-red-600">{errors.due_time}</p>
                )}
              </div>

              {/* Status Tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Status Tips</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <span className="font-medium">Pending:</span> Task is ready to start</li>
                  <li>• <span className="font-medium">In Progress:</span> Task is currently being worked on</li>
                  <li>• <span className="font-medium">Completed:</span> Task is finished</li>
                  <li>• <span className="font-medium">Cancelled:</span> Task is no longer needed</li>
                </ul>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link
                  href={`/my-services/tasks/${id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Updating..." : "Update Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}