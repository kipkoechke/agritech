"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdBookOnline } from "react-icons/md";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useBooking, useUpdateBooking } from "@/hooks/useBooking";
import { useSchedules } from "@/hooks/useSchedule";
import { useWorkers } from "@/hooks/useWorkers";
import type { UpdateBookingData } from "@/types/booking";

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: bookingResponse, isLoading } = useBooking(id);
  const updateBooking = useUpdateBooking();
  const booking = bookingResponse?.data;

  const { data: schedulesData, isLoading: schedulesLoading } = useSchedules();
  const { data: workersData, isLoading: workersLoading } = useWorkers();

  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);

  const scheduleValue =
    scheduleId ?? (booking ? booking.schedule.id : "");
  const workerValue = workerId ?? (booking ? booking.worker.id : "");

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
    const payload: UpdateBookingData = {
      schedule_id: scheduleValue,
      worker_id: workerValue,
    };
    updateBooking.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/bookings/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Booking not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href={`/bookings/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Booking Details
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdBookOnline className="w-6 h-6 text-emerald-600" />
              Edit Booking
            </h1>
            <p className="text-gray-500 mt-1">Update booking assignment</p>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <SearchableSelect
              label="Schedule"
              options={scheduleOptions}
              value={scheduleValue}
              onChange={setScheduleId}
              placeholder="Select schedule"
              isLoading={schedulesLoading}
              required
            />

            <SearchableSelect
              label="Worker"
              options={workerOptions}
              value={workerValue}
              onChange={setWorkerId}
              placeholder="Select worker"
              isLoading={workersLoading}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/bookings/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateBooking.isPending}
              >
                {updateBooking.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
