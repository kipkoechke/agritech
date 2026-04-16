"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdLocalActivity } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useActivity, useUpdateActivity } from "@/hooks/useActivity";
import type { UpdateActivityData } from "@/types/activity";

interface ActivityFormData {
  name: string;
  uom: string;
}

export default function EditActivityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: activityResponse, isLoading } = useActivity(id);
  const updateActivity = useUpdateActivity();
  const activity = activityResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormData>({
    values: activity ? { name: activity.name, uom: activity.uom } : undefined,
  });

  const [isActive, setIsActive] = useState<string | null>(null);

  const activeValue =
    isActive ?? (activity ? String(activity.is_active) : "true");

  const onSubmit = (data: ActivityFormData) => {
    const payload: UpdateActivityData = {
      name: data.name,
      uom: data.uom,
      is_active: activeValue === "true",
    };
    updateActivity.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/activities/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Activity not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href={`/activities/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdLocalActivity className="w-6 h-6 text-emerald-600" />
                  Edit Activity
                </h1>
                <p className="text-gray-500 mt-1">
                  Update activity information
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Name"
              placeholder="e.g. Tea Plucking"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <InputField
              label="Unit of Measure"
              placeholder="e.g. kg, hours, liters"
              register={register("uom", {
                required: "Unit of measure is required",
              })}
              error={errors.uom?.message}
              required
            />

            <SearchableSelect
              label="Status"
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              value={activeValue}
              onChange={setIsActive}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/activities/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateActivity.isPending}
              >
                {updateActivity.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
