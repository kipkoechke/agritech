"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTask, useCompleteTask } from "@/hooks/useTasks";
import { TextAreaField } from "@/components/common/TextAreaField";
import { MdArrowBack } from "react-icons/md";
import { useForm } from "react-hook-form";

export default function CompleteTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: taskData, isLoading } = useTask(id);
  const task = taskData?.data;
  const completeTaskMutation = useCompleteTask();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ completion_notes: string }>();

  const onSubmit = handleSubmit((data) => {
    completeTaskMutation.mutate(
      { id, payload: data },
      {
        onSuccess: () => {
          router.push("/my-services/tasks");
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

  if (task.status === "completed") {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 text-sm mb-4">
          This task has already been completed
        </p>
        <Link
          href={`/my-services/tasks/${id}`}
          className="text-accent hover:underline"
        >
          View Task Details
        </Link>
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
        <h2 className="text-lg font-semibold text-gray-900">Complete Task</h2>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <TextAreaField
            label="Completion Notes"
            register={register("completion_notes")}
            error={errors.completion_notes?.message}
            placeholder="Enter details about how you completed this task (e.g., Interviewed 3 witnesses, collected CCTV footage, filed report)..."
            rows={8}
            required
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
              disabled={completeTaskMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completeTaskMutation.isPending
                ? "Completing..."
                : "Complete Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
