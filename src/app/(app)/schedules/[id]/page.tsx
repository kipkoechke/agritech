"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdCancel,
  MdEdit,
  MdInfo,
  MdContentCopy,
  MdAgriculture,
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdPerson,
  MdEmail,
  MdNotes,
  MdPeople,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdScale,
  MdPhone,
  MdCheck,
  MdCreate,
} from "react-icons/md";
import { useSchedule, useCancelSchedule } from "@/hooks/useSchedule";
import {
  useConfirmAttendance,
  useCaptureFarmQuantity,
  useCaptureFactoryQuantity,
  useWorkerSignOff,
} from "@/hooks/useBooking";
import type { ScheduleBooking } from "@/types/schedule";

/* ── helpers ── */
const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-700",
  approved: "bg-green-100  text-green-700",
  cancelled: "bg-red-100    text-red-600",
};

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ── sub-components ── */
function InfoTile({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {label}
        </span>
      </div>
      <div className="text-sm font-medium text-gray-800 leading-snug">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  on,
  label,
  onClass,
}: {
  on: boolean;
  label: string;
  onClass: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
        on
          ? onClass
          : "border-dashed border-gray-200 bg-transparent text-gray-400"
      }`}
    >
      {on ? (
        <MdCheckCircle className="w-3 h-3" />
      ) : (
        <MdRadioButtonUnchecked className="w-3 h-3 opacity-50" />
      )}
      {label}
    </span>
  );
}

function ProgressRing({
  value,
  color,
  trackColor,
}: {
  value: number;
  color: string;
  trackColor: string;
}) {
  const r = 14;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" stroke={trackColor} />
      <circle
        cx="18" cy="18" r={r} fill="none" strokeWidth="3" stroke={color}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

/* ── WorkerRow with inline actions ── */
type RowState = {
  showFarmQty: boolean;
  showFactoryQty: boolean;
  farmQtyInput: string;
  factoryQtyInput: string;
};

function WorkerRow({
  booking,
  confirmMutation,
  farmQtyMutation,
  factoryQtyMutation,
  signOffMutation,
}: {
  booking: ScheduleBooking;
  confirmMutation: ReturnType<typeof useConfirmAttendance>;
  farmQtyMutation: ReturnType<typeof useCaptureFarmQuantity>;
  factoryQtyMutation: ReturnType<typeof useCaptureFactoryQuantity>;
  signOffMutation: ReturnType<typeof useWorkerSignOff>;
}) {
  const worker = booking.worker;
  const [state, setState] = useState<RowState>({
    showFarmQty: false,
    showFactoryQty: false,
    farmQtyInput: booking.farm_qty != null ? String(booking.farm_qty) : "",
    factoryQtyInput:
      booking.factory_qty != null ? String(booking.factory_qty) : "",
  });

  const toggleFarmQty = () =>
    setState((s) => ({ ...s, showFarmQty: !s.showFarmQty }));
  const toggleFactoryQty = () =>
    setState((s) => ({ ...s, showFactoryQty: !s.showFactoryQty }));

  const submitFarmQty = () => {
    const num = parseFloat(state.farmQtyInput);
    if (!isNaN(num) && num >= 0) {
      farmQtyMutation.mutate(
        { id: booking.id, farm_qty: num },
        { onSuccess: () => setState((s) => ({ ...s, showFarmQty: false })) },
      );
    }
  };

  const submitFactoryQty = () => {
    const num = parseFloat(state.factoryQtyInput);
    if (!isNaN(num) && num >= 0) {
      factoryQtyMutation.mutate(
        { id: booking.id, factory_qty: num },
        {
          onSuccess: () => setState((s) => ({ ...s, showFactoryQty: false })),
        },
      );
    }
  };

  return (
    <div className="px-4 py-3 border-b border-gray-50/80 last:border-0 hover:bg-[#F9FAFB] transition-colors">
      {/* Row 1: avatar + name + status badges */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-emerald-700 tracking-tight">
            {initials(worker?.name ?? "?")}
          </span>
        </div>

        {/* Name + phone */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {worker?.name ?? "—"}
          </p>
          {worker?.phone && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <MdPhone className="w-3 h-3" />
              {worker.phone}
            </p>
          )}
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge
            on={booking.is_confirmed}
            label="Confirmed"
            onClass="border-emerald-200 bg-emerald-50 text-emerald-700"
          />
          <StatusBadge
            on={booking.worker_signed}
            label="Signed"
            onClass="border-blue-200 bg-blue-50 text-blue-600"
          />
        </div>
      </div>

      {/* Row 2: qty display + action buttons */}
      <div className="mt-2 ml-11 flex items-center gap-3 flex-wrap">
        {/* Farm qty */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Farm
          </span>
          {booking.farm_qty != null ? (
            <span className="text-xs font-semibold text-gray-700 tabular-nums">
              {Number(booking.farm_qty).toFixed(2)} kg
            </span>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </div>
        <span className="text-gray-200 text-xs">·</span>
        {/* Factory qty */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Factory
          </span>
          {booking.factory_qty != null ? (
            <span className="text-xs font-semibold text-gray-700 tabular-nums">
              {Number(booking.factory_qty).toFixed(2)} kg
            </span>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Confirm */}
          {!booking.is_confirmed && (
            <button
              onClick={() => confirmMutation.mutate(booking.id)}
              disabled={confirmMutation.isPending}
              title="Confirm attendance"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              <MdCheck className="w-3 h-3" />
              Confirm
            </button>
          )}

          {/* Farm Qty */}
          <button
            onClick={toggleFarmQty}
            title="Capture farm quantity"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <MdScale className="w-3 h-3" />
            Farm Qty
          </button>

          {/* Factory Qty */}
          <button
            onClick={toggleFactoryQty}
            title="Capture factory quantity"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <MdScale className="w-3 h-3" />
            Factory Qty
          </button>

          {/* Sign Off */}
          {!booking.worker_signed && (
            <button
              onClick={() => signOffMutation.mutate(booking.id)}
              disabled={signOffMutation.isPending}
              title="Sign off worker"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 transition-colors"
            >
              <MdCreate className="w-3 h-3" />
              Sign Off
            </button>
          )}
        </div>
      </div>

      {/* Inline farm qty form */}
      {state.showFarmQty && (
        <div className="mt-2 ml-11 flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.farmQtyInput}
            onChange={(e) =>
              setState((s) => ({ ...s, farmQtyInput: e.target.value }))
            }
            placeholder="Enter kg"
            className="w-28 px-2.5 py-1.5 text-xs border border-amber-300 rounded-full focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            onClick={submitFarmQty}
            disabled={farmQtyMutation.isPending}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {farmQtyMutation.isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={toggleFarmQty}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Inline factory qty form */}
      {state.showFactoryQty && (
        <div className="mt-2 ml-11 flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.factoryQtyInput}
            onChange={(e) =>
              setState((s) => ({ ...s, factoryQtyInput: e.target.value }))
            }
            placeholder="Enter kg"
            className="w-28 px-2.5 py-1.5 text-xs border border-blue-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={submitFactoryQty}
            disabled={factoryQtyMutation.isPending}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {factoryQtyMutation.isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={toggleFactoryQty}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* ── main page ── */
export default function ScheduleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading } = useSchedule(id);
  const cancelSchedule = useCancelSchedule();

  /* booking action mutations — single instance per page, passed down to rows */
  const confirmMutation = useConfirmAttendance();
  const farmQtyMutation = useCaptureFarmQuantity();
  const factoryQtyMutation = useCaptureFactoryQuantity();
  const signOffMutation = useWorkerSignOff();

  const schedule = scheduleResponse?.data;
  const bookings = schedule?.bookings?.data ?? [];
  const bookingsCount = schedule?.bookings_count ?? 0;

  /* loading */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading schedule…</p>
        </div>
      </div>
    );
  }

  /* not found */
  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Schedule not found
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This schedule doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/schedules"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Schedules
          </Link>
        </div>
      </div>
    );
  }

  /* derived values */
  const scheduledDate = new Date(schedule.scheduled_date);
  const createdDate = new Date(schedule.created_at);

  const confirmedCount = bookings.filter((b) => b.is_confirmed).length;
  const signedCount = bookings.filter((b) => b.worker_signed).length;
  const withQuantitiesCount = bookings.filter(
    (b) => b.farm_qty != null,
  ).length;

  const humanDate = scheduledDate.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const humanTime = scheduledDate.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* left */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/schedules"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-gray-900 truncate">
                  {schedule.activity.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${STATUS_STYLES[schedule.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {statusLabel(schedule.status)}
                </span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(schedule.reference_code)
                  }
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0 group"
                  title="Copy reference code"
                >
                  <span className="text-[10px] font-mono font-medium text-gray-500 group-hover:text-gray-700">
                    {schedule.reference_code}
                  </span>
                  <MdContentCopy className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">
                {schedule.farm.name} &middot; {schedule.farm.zone.name}
              </p>
            </div>
          </div>

          {/* right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {schedule.status !== "cancelled" && (
              <button
                onClick={() => cancelSchedule.mutate(id)}
                disabled={cancelSchedule.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold hover:bg-orange-200 disabled:opacity-50 transition-colors"
              >
                <MdCancel className="w-3.5 h-3.5" />
                {cancelSchedule.isPending ? "Cancelling…" : "Cancel"}
              </button>
            )}
            <Link
              href={`/schedules/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <MdEdit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* ── Page Body: 2-column layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── Left: Schedule Details ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Details card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <MdCalendarToday className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Schedule Details
                </h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <InfoTile
                  icon={MdAgriculture}
                  label="Activity"
                  value={schedule.activity.name}
                />
                <InfoTile
                  icon={MdCalendarToday}
                  label="Date"
                  value={humanDate}
                />
                <InfoTile
                  icon={MdAccessTime}
                  label="Time"
                  value={humanTime}
                />
                <InfoTile
                  icon={MdLocationOn}
                  label="Farm"
                  value={schedule.farm.name}
                />
                <InfoTile
                  icon={MdLocationOn}
                  label="Zone"
                  value={schedule.farm.zone.name}
                />
                {schedule.farm.area && (
                  <InfoTile
                    icon={MdScale}
                    label="Farm Area"
                    value={`${schedule.farm.area} acres`}
                  />
                )}
                <InfoTile
                  icon={MdPerson}
                  label="Created By"
                  value={schedule.created_by.name}
                />
                {schedule.created_by.email && (
                  <InfoTile
                    icon={MdEmail}
                    label="Creator Email"
                    value={schedule.created_by.email}
                    className="sm:col-span-2"
                  />
                )}
                <InfoTile
                  icon={MdCalendarToday}
                  label="Created"
                  value={createdDate.toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
              </div>

              {/* Notes */}
              <div className="px-5 pb-4 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <MdNotes className="w-3.5 h-3.5 text-primary/70" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Notes
                  </span>
                </div>
                {schedule.notes ? (
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    {schedule.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-300 italic">
                    No notes recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Summary stats card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <MdPeople className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Summary
                </h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Total",
                    value: bookingsCount,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Confirmed",
                    value: confirmedCount,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Signed",
                    value: signedCount,
                    color: "text-purple-600",
                    bg: "bg-purple-50",
                  },
                  {
                    label: "With Yield",
                    value: withQuantitiesCount,
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Assigned Workers ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {/* Workers header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <MdPeople className="w-4 h-4 text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-[-0.01em] text-gray-500">
                    Assigned Workers
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    {bookingsCount}
                  </span>
                </div>
                {bookings.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-16 tracking-[0.02em]">
                        Confirmed
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${Math.round((confirmedCount / bookings.length) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold tabular-nums">
                        {confirmedCount}/{bookings.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-16 tracking-[0.02em]">
                        Signed
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-blue-400 transition-all duration-500"
                          style={{
                            width: `${Math.round((signedCount / bookings.length) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-blue-500 font-semibold tabular-nums">
                        {signedCount}/{bookings.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable rows */}
              {bookings.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <MdPeople className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">
                    No workers assigned to this schedule yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[600px]">
                  {bookings.map((booking) => (
                    <WorkerRow
                      key={booking.id}
                      booking={booking}
                      confirmMutation={confirmMutation}
                      farmQtyMutation={farmQtyMutation}
                      factoryQtyMutation={factoryQtyMutation}
                      signOffMutation={signOffMutation}
                    />
                  ))}
                </div>
              )}

              {/* Summary footer — circular progress rings */}
              {bookings.length > 0 && (
                <div className="px-5 py-4 bg-[#F9FAFB] border-t border-gray-100 flex flex-wrap items-center gap-6 flex-shrink-0">
                  {(
                    [
                      {
                        label: "Confirmation",
                        value: Math.round(
                          (confirmedCount / bookings.length) * 100,
                        ),
                        color: "#10b981",
                        trackColor: "#d1fae5",
                      },
                      {
                        label: "Sign Rate",
                        value: Math.round(
                          (signedCount / bookings.length) * 100,
                        ),
                        color: "#60a5fa",
                        trackColor: "#dbeafe",
                      },
                      {
                        label: "Yield Recorded",
                        value: Math.round(
                          (withQuantitiesCount / bookings.length) * 100,
                        ),
                        color: "#f59e0b",
                        trackColor: "#fef3c7",
                      },
                    ] as {
                      label: string;
                      value: number;
                      color: string;
                      trackColor: string;
                    }[]
                  ).map(({ label, value, color, trackColor }) => (
                    <div key={label} className="flex items-center gap-3">
                      <ProgressRing
                        value={value}
                        color={color}
                        trackColor={trackColor}
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-800 tracking-[-0.01em]">
                          {value}%
                        </p>
                        <p className="text-[10px] text-gray-400 tracking-[0.02em] mt-0.5">
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
