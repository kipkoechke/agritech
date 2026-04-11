"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  MdArrowBack,
  MdSchedule,
  MdCancel,
  MdPerson,
  MdAgriculture,
  MdLocationOn,
  MdCalendarToday,
  MdCheckCircle,
  MdCancel as MdCancelIcon,
  MdPhone,
  MdExpandMore,
  MdExpandLess,
  MdPeople,
  MdEvent,
} from "react-icons/md";
import Button from "@/components/common/Button";
import { useSchedule, useCancelSchedule } from "@/hooks/useSchedule";

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  badgeCount
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  badgeCount?: number;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/20 text-primary">
              {badgeCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <MdExpandLess className="w-4 h-4 text-gray-400" />
        ) : (
          <MdExpandMore className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Detail Row Component
const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string | number; icon?: any }) => (
  <div className="flex items-start py-2">
    <div className="w-28 flex-shrink-0">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
    </div>
    <div className="flex-1">
      <span className="text-xs text-gray-800 font-medium">{value || "—"}</span>
    </div>
  </div>
);

// Booking Card Component
const BookingCard = ({ booking }: { booking: any }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <MdPerson className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">{booking.worker?.name || "Unknown Worker"}</p>
            {booking.worker?.phone && (
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <MdPhone className="w-2.5 h-2.5" />
                {booking.worker.phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {booking.is_confirmed && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-green-100 text-green-700">
              <MdCheckCircle className="w-2.5 h-2.5" />
              Confirmed
            </span>
          )}
          {booking.worker_signed && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-blue-100 text-blue-700">
              Signed
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200">
        <div>
          <p className="text-[9px] text-gray-500">Farm Qty</p>
          <p className="text-xs font-semibold text-gray-900">
            {booking.farm_qty ? `${booking.farm_qty} kg` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-gray-500">Factory Qty</p>
          <p className="text-xs font-semibold text-gray-900">
            {booking.factory_qty ? `${booking.factory_qty} kg` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ScheduleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading } = useSchedule(id);
  const cancelSchedule = useCancelSchedule();

  const schedule = scheduleResponse?.data;
  const bookings = schedule?.bookings?.data || [];
  const bookingsCount = schedule?.bookings_count || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
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

  const scheduledDate = new Date(schedule.scheduled_date);
  const createdDate = new Date(schedule.created_at);
  const updatedDate = new Date(schedule.updated_at);
  const isUpdated = schedule.created_at !== schedule.updated_at;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/schedules"
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-4 h-4 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <MdSchedule className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-bold text-gray-900">
                    {schedule.reference_code}
                  </h1>
                  <span
                    className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      schedule.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {schedule.activity.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {schedule.status !== "cancelled" && (
                <button
                  onClick={() => cancelSchedule.mutate(id)}
                  disabled={cancelSchedule.isPending}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
                >
                  <MdCancel className="w-3.5 h-3.5" />
                  {cancelSchedule.isPending ? "Cancelling..." : "Cancel"}
                </button>
              )}
              <Button type="small" to={`/schedules/${id}/edit`}>
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Schedule Details Section - Closed by default */}
          <CollapsibleSection title="Schedule Details" icon={MdSchedule} defaultOpen={false}>
            <div className="space-y-1">
              <DetailRow label="Reference Code" value={schedule.reference_code} />
              <DetailRow label="Activity" value={schedule.activity.name} icon={MdAgriculture} />
              <DetailRow 
                label="Scheduled Date" 
                value={scheduledDate.toLocaleDateString("en-KE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} 
                icon={MdCalendarToday}
              />
              {schedule.notes && (
                <div className="flex items-start py-2">
                  <div className="w-28 flex-shrink-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Notes</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">{schedule.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Farm Details Section - Closed by default */}
          <CollapsibleSection title="Farm Details" icon={MdAgriculture} defaultOpen={false}>
            <div className="space-y-1">
              <DetailRow label="Farm Name" value={schedule.farm.name} icon={MdAgriculture} />
              <DetailRow label="Zone" value={schedule.farm.zone.name} icon={MdLocationOn} />
            </div>
          </CollapsibleSection>

          {/* Creator Information Section - Closed by default */}
          <CollapsibleSection title="Creator Information" icon={MdPerson} defaultOpen={false}>
            <div className="space-y-1">
              <DetailRow label="Created By" value={schedule.created_by.name} icon={MdPerson} />
              <DetailRow 
                label="Created At" 
                value={createdDate.toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} 
                icon={MdCalendarToday}
              />
              {isUpdated && (
                <DetailRow 
                  label="Updated At" 
                  value={updatedDate.toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} 
                  icon={MdCalendarToday}
                />
              )}
            </div>
          </CollapsibleSection>

          {/* Bookings Section - Closed by default */}
          <CollapsibleSection 
            title="Bookings" 
            icon={MdPeople} 
            defaultOpen={false}
            badgeCount={bookingsCount}
          >
            {bookings.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MdPeople className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-xs text-gray-500">No bookings for this schedule</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking: any, index: number) => (
                  <div key={booking.id}>
                    <BookingCard booking={booking} />
                    {index < bookings.length - 1 && <div className="border-t border-gray-100 my-2" />}
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Summary Stats - Only visible if there are bookings */}
          {bookings.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MdEvent className="w-3.5 h-3.5 text-primary" />
                Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
                  <p className="text-[9px] text-gray-500">Total Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">
                    {bookings.filter((b: any) => b.is_confirmed).length}
                  </p>
                  <p className="text-[9px] text-gray-500">Confirmed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">
                    {bookings.filter((b: any) => b.worker_signed).length}
                  </p>
                  <p className="text-[9px] text-gray-500">Worker Signed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-600">
                    {bookings.filter((b: any) => b.farm_qty !== null).length}
                  </p>
                  <p className="text-[9px] text-gray-500">With Quantities</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}