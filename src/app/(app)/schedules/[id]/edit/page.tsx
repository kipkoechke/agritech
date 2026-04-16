"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdSchedule } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useSchedule, useUpdateSchedule } from "@/hooks/useSchedule";
import { useFarms } from "@/hooks/useFarm";
import { useActivities } from "@/hooks/useActivity";
import type { UpdateScheduleData } from "@/types/schedule";

interface ScheduleFormData {
  scheduled_date: string;
  notes: string;
}

export default function EditSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: scheduleResponse, isLoading } = useSchedule(id);
  const updateSchedule = useUpdateSchedule();
  const schedule = scheduleResponse?.data;

  const { data: farmsData, isLoading: farmsLoading } = useFarms();
  const { data: activitiesData, isLoading: activitiesLoading } =
    useActivities();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    values: schedule
      ? {
          scheduled_date: schedule.scheduled_date?.split("T")[0] || "",
          notes: schedule.notes || "",
        }
      : undefined,
  });

  const [farmId, setFarmId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);

  const farmValue = farmId ?? (schedule ? schedule.farm.id : "");
  const activityValue =
    activityId ?? (schedule ? schedule.activity.id : "");

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

  const onSubmit = (data: ScheduleFormData) => {
    const payload: UpdateScheduleData = {
      farm_id: farmValue,
      farm_activity_id: activityValue,
      scheduled_date: data.scheduled_date,
      notes: data.notes || undefined,
    };
    updateSchedule.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/schedules/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Schedule not found
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
                href={`/schedules/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdSchedule className="w-6 h-6 text-emerald-600" />
                  Edit Schedule
                </h1>
                <p className="text-gray-500 mt-1">Update schedule information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <SearchableSelect
              label="Farm"
              options={farmOptions}
              value={farmValue}
              onChange={setFarmId}
              placeholder="Select farm"
              isLoading={farmsLoading}
              required
            />

            <SearchableSelect
              label="Activity"
              options={activityOptions}
              value={activityValue}
              onChange={setActivityId}
              placeholder="Select activity"
              isLoading={activitiesLoading}
              required
            />

            <InputField
              label="Scheduled Date"
              type="date"
              register={register("scheduled_date", {
                required: "Scheduled date is required",
              })}
              error={errors.scheduled_date?.message}
              required
            />

            <InputField
              label="Notes"
              placeholder="Optional notes"
              register={register("notes")}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/schedules/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateSchedule.isPending}
              >
                {updateSchedule.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
