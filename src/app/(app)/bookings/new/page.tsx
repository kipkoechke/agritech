"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdBookOnline } from "react-icons/md";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateBooking } from "@/hooks/useBooking";
import { useSchedules } from "@/hooks/useSchedule";
import { useWorkers } from "@/hooks/useWorkers";
import type { CreateBookingData } from "@/types/booking";

export default function NewBookingPage() {
  const router = useRouter();
  const createBooking = useCreateBooking();

  const { data: schedulesData, isLoading: schedulesLoading } = useSchedules({
    status: "scheduled",
  });
  const { data: workersData, isLoading: workersLoading } = useWorkers();

  const [scheduleId, setScheduleId] = useState("");
  const [workerId, setWorkerId] = useState("");

  const schedules = schedulesData?.data || [];
  const workers = workersData?.data || [];

  const scheduleOptions = schedules.map((s) => ({
    value: s.id,
    label: `${s.reference_code} — ${s.activity.name} (${s.farm.name})`,
  }));

  const workerOptions = workers.map((w) => ({
    value: w.id,
    label: w.name,
    description: w.phone,
  }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleId || !workerId) return;
    const payload: CreateBookingData = {
      schedule_id: scheduleId,
      worker_id: workerId,
    };
    createBooking.mutate(payload, {
      onSuccess: () => router.push("/bookings"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Bookings
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdBookOnline className="w-6 h-6 text-emerald-600" />
              Create New Booking
            </h1>
            <p className="text-gray-500 mt-1">
              Assign a worker to a schedule
            </p>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <SearchableSelect
              label="Schedule"
              options={scheduleOptions}
              value={scheduleId}
              onChange={setScheduleId}
              placeholder="Select schedule"
              isLoading={schedulesLoading}
              required
            />

            <SearchableSelect
              label="Worker"
              options={workerOptions}
              value={workerId}
              onChange={setWorkerId}
              placeholder="Select worker"
              isLoading={workersLoading}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/bookings">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  createBooking.isPending || !scheduleId || !workerId
                }
              >
                {createBooking.isPending
                  ? "Creating..."
                  : "Create Booking"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
