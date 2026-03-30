"use client";

import React, { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTask, useUpdateTask } from "@/hooks/useTasks";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SelectField } from "@/components/common/SelectField";
import { MdArrowBack } from "react-icons/md";
import { useForm } from "react-hook-form";

interface UpdateTaskFormData {
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_time: string;
}

export default function UpdateTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: taskData, isLoading } = useTask(id);
  const task = taskData?.data;
  const updateTaskMutation = useUpdateTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateTaskFormData>();

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_time: new Date(task.due_time).toISOString().slice(0, 16),
      });
    }
  }, [task, reset]);

  const onSubmit = handleSubmit((data) => {
    updateTaskMutation.mutate(
      { id, payload: data },
      {
        onSuccess: () => {
          router.push(`/my-services/tasks/${id}`);
        },
      }
    );
  });

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
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
        <Link
          href={`/my-services/tasks/${id}`}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdArrowBack className="w-5 h-5 text-gray-600" />
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">Update Task</h2>
      </div>

      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
          <InputField
            label="Title"
            type="text"
            placeholder="Enter task title"
            register={register("title", {
              required: "Title is required",
            })}
            error={errors.title?.message}
          />

          <TextAreaField
            label="Description"
            placeholder="Enter task description"
            register={register("description")}
            error={errors.description?.message}
            rows={4}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Status"
              register={register("status", {
                required: "Status is required",
              })}
              error={errors.status?.message}
              options={[
                { value: "pending", label: "Pending" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />

            <SelectField
              label="Priority"
              register={register("priority", {
                required: "Priority is required",
              })}
              error={errors.priority?.message}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
          </div>

          <InputField
            label="Due Date & Time"
            type="datetime-local"
            placeholder=""
            register={register("due_time", {
              required: "Due date is required",
            })}
            error={errors.due_time?.message}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href={`/my-services/tasks/${id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateTaskMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
