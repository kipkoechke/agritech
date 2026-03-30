"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateLeave, useLeaveReasonOptions } from "@/hooks/useLeaves";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SelectField } from "@/components/common/SelectField";
import { MdArrowBack } from "react-icons/md";
import { useForm } from "react-hook-form";
import { CreateLeavePayload } from "@/types/leaves";

export default function AddLeavePage() {
  const router = useRouter();
  const createLeaveMutation = useCreateLeave();
  const { options: reasonOptions, isLoading: reasonsLoading } =
    useLeaveReasonOptions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLeavePayload>();

  const onSubmit = handleSubmit((data) => {
    createLeaveMutation.mutate(data, {
      onSuccess: () => {
        router.push("/my-services/leave");
      },
    });
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
        <Link
          href="/my-services/leave"
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdArrowBack className="w-5 h-5 text-gray-600" />
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">Apply for Leave</h2>
      </div>

      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
          <SelectField
            label="Leave Reason"
            register={register("reason_id", {
              required: "Leave reason is required",
            })}
            error={errors.reason_id?.message}
            options={reasonOptions}
            disabled={reasonsLoading}
            placeholder={
              reasonsLoading ? "Loading reasons..." : "Select leave reason"
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Start Date & Time"
              type="datetime-local"
              register={register("leave_start", {
                required: "Start date is required",
              })}
              error={errors.leave_start?.message} placeholder={""}            />

            <InputField
              label="End Date & Time"
              type="datetime-local"
              register={register("leave_end", {
                required: "End date is required",
              })}
              error={errors.leave_end?.message} placeholder={""}            />
          </div>

          <TextAreaField
            label="Description"
            placeholder="Provide details about your leave request..."
            register={register("description", {
              required: "Description is required",
            })}
            error={errors.description?.message}
            rows={6}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/my-services/leave"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createLeaveMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createLeaveMutation.isPending
                ? "Submitting..."
                : "Submit Leave Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}