"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdSchedule } from "react-icons/md";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateSchedule } from "@/hooks/useSchedule";
import { useFarms } from "@/hooks/useFarm";
import { useActivities } from "@/hooks/useActivity";
import { useWorkGroups } from "@/hooks/useWorkGroup";
import type { CreateScheduleData } from "@/types/schedule";

interface ScheduleFormData {
  scheduled_date: string;
  notes: string;
}

export default function NewSchedulePage() {
  const router = useRouter();
  const createSchedule = useCreateSchedule();

  const { data: farmsData, isLoading: farmsLoading } = useFarms();
  const { data: activitiesData, isLoading: activitiesLoading } =
    useActivities();
  const { data: workGroupsData, isLoading: workGroupsLoading } = useWorkGroups({
    active: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    defaultValues: { scheduled_date: "", notes: "" },
  });

  const [farmId, setFarmId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [workGroupIds, setWorkGroupIds] = useState<string[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const farms = farmsData?.data || [];
  const activities = activitiesData?.data || [];

  const farmOptions = farms.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  const activityOptions = activities.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  const workGroups = workGroupsData?.data || [];
  const workGroupOptions = workGroups.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  const onSubmit = (data: ScheduleFormData) => {
    setSubmitAttempted(true);
    if (!farmId || !activityId || workGroupIds.length === 0) return;
    const payload: CreateScheduleData = {
      farm_id: farmId,
      farm_activity_id: activityId,
      work_group_ids: workGroupIds,
      scheduled_date: data.scheduled_date,
      notes: data.notes || undefined,
    };
    createSchedule.mutate(payload, {
      onSuccess: () => router.push("/schedules"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/schedules"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Schedules
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdSchedule className="w-6 h-6 text-emerald-600" />
              Create New Schedule
            </h1>
            <p className="text-gray-500 mt-1">Schedule a farm activity</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Row 1: Farm | Work Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Farm"
                options={farmOptions}
                value={farmId}
                onChange={setFarmId}
                placeholder="Select farm"
                isLoading={farmsLoading}
                required
              />

              <SearchableSelect
                label="Work Groups"
                options={workGroupOptions}
                multiSelect
                values={workGroupIds}
                onChangeMulti={setWorkGroupIds}
                placeholder="Select work groups"
                isLoading={workGroupsLoading}
                required
                error={
                  submitAttempted && workGroupIds.length === 0
                    ? "Please select at least one work group"
                    : undefined
                }
              />
            </div>

            {/* Row 2: Activity | Scheduled Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Activity"
                options={activityOptions}
                value={activityId}
                onChange={setActivityId}
                placeholder="Select activity"
                isLoading={activitiesLoading}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("scheduled_date", {
                    required: "Scheduled date is required",
                  })}
                  className="border-gray-300 focus:border-emerald-500 text-gray-900 focus:ring-emerald-500 hover:border-gray-400 w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                />
                {errors.scheduled_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.scheduled_date.message}</p>
                )}
              </div>
            </div>

            {/* Row 3: Notes (Full Width) */}
            <TextAreaField
              label="Notes"
              placeholder="Optional notes"
              register={register("notes")}
              rows={3}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/schedules">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createSchedule.isPending || !farmId || !activityId || workGroupIds.length === 0}
              >
                {createSchedule.isPending ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
