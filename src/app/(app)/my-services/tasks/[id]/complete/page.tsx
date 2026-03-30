"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_time: string;
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
    created_at: "2026-03-29T10:30:00",
    updated_at: "2026-04-01T14:20:00",
  },
];

export default function CompleteTaskPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Simulate API call to fetch task
    setTimeout(() => {
      const foundTask = DUMMY_TASKS.find(t => t.id === id);
      setTask(foundTask || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!completionNotes.trim()) {
      setError("Completion notes are required");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to complete task
    setTimeout(() => {
      // In a real app, you would update the task status in your state management
      console.log("Task completed:", { 
        id, 
        completion_notes: completionNotes,
        completed_at: new Date().toISOString()
      });
      
      setIsSubmitting(false);
      alert("Task completed successfully!");
      router.push("/my-services/tasks");
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
              <h2 className="text-lg font-semibold text-gray-900">Complete Task</h2>
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
              <h2 className="text-lg font-semibold text-gray-900">Complete Task</h2>
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

  if (task.status === "completed") {
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
              <h2 className="text-lg font-semibold text-gray-900">Complete Task</h2>
            </div>
            <div className="p-8 text-center">
              <div className="text-green-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                This task has already been completed
              </p>
              <Link
                href={`/my-services/tasks/${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Task Details
              </Link>
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
            <h2 className="text-lg font-semibold text-gray-900">Complete Task</h2>
          </div>

          <div className="p-6">
            {/* Task Summary Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
              <div className="mt-3 flex gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className={`ml-1 font-medium ${
                    task.priority === "urgent" ? "text-red-600" :
                    task.priority === "high" ? "text-orange-600" :
                    task.priority === "medium" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Due:</span>
                  <span className="ml-1 text-gray-700">
                    {new Date(task.due_time).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Notes *
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => {
                    setCompletionNotes(e.target.value);
                    if (error) setError("");
                  }}
                  rows={8}
                  placeholder="Enter details about how you completed this task..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {error && (
                  <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Include important details such as: what was done, any challenges faced, resources used, and next steps if any.
                </p>
              </div>

              {/* Completion Checklist */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Completion Checklist</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    Task completed as described
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    All required documentation attached
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    Supervisor notified of completion
                  </label>
                </div>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Completing..." : "Complete Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}