"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdLocalActivity } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateActivity } from "@/hooks/useActivity";
import type { CreateActivityData } from "@/types/activity";

interface ActivityFormData {
  name: string;
  uom: string;
}

export default function NewActivityPage() {
  const router = useRouter();
  const createActivity = useCreateActivity();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormData>({
    defaultValues: { name: "", uom: "" },
  });

  const [isActive, setIsActive] = useState("true");

  const onSubmit = (data: ActivityFormData) => {
    const payload: CreateActivityData = {
      name: data.name,
      uom: data.uom,
      is_active: isActive === "true",
    };
    createActivity.mutate(payload, {
      onSuccess: () => router.push("/activities"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Activities
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdLocalActivity className="w-6 h-6 text-emerald-600" />
              Add New Activity
            </h1>
            <p className="text-gray-500 mt-1">Create a new farm activity</p>
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
              value={isActive}
              onChange={setIsActive}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/activities">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createActivity.isPending}
              >
                {createActivity.isPending ? "Creating..." : "Create Activity"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
