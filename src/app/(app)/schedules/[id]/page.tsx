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
  approved: "bg-green-100 text-green-700",
  cancelled: "bg-red-100   text-red-600",
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

/* ── InfoTile ── */
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
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {label}
        </span>
      </div>
      <div className="text-sm font-semibold text-gray-800 leading-snug">
        {value}
      </div>
    </div>
  );
}

/* ── StatusBadge ── */
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
        on ? onClass : "border border-gray-200 bg-gray-50 text-gray-400"
      }`}
    >
      {on ? (
        <MdCheckCircle className="w-3 h-3" />
      ) : (
        <MdRadioButtonUnchecked className="w-3 h-3 opacity-40" />
      )}
      {label}
    </span>
  );
}

/* ── Compact ProgressRing for header ── */
function MiniRing({
  value,
  color,
  trackColor,
  label,
}: {
  value: number;
  color: string;
  trackColor: string;
  label: string;
}) {
  const r = 12;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex items-center gap-1.5">
      <svg className="w-8 h-8 -rotate-90 shrink-0" viewBox="0 0 30 30">
        <circle
          cx="15"
          cy="15"
          r={r}
          fill="none"
          strokeWidth="3"
          stroke={trackColor}
        />
        <circle
          cx="15"
          cy="15"
          r={r}
          fill="none"
          strokeWidth="3"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="leading-tight">
        <p className="text-xs font-bold text-gray-800 tabular-nums">{value}%</p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide">
          {label}
        </p>
      </div>
    </div>
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
        { onSuccess: () => setState((s) => ({ ...s, showFactoryQty: false })) },
      );
    }
  };

  return (
    <div className="px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      {/* Row 1: avatar + name + phone + status badges */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
          <span className="text-xs font-extrabold text-emerald-800 tracking-tight">
            {initials(worker?.name ?? "?")}
          </span>
        </div>

        {/* Name + phone */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate leading-tight">
            {worker?.name ?? "—"}
          </p>
          {worker?.phone && (
            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
              <MdPhone className="w-3 h-3 text-gray-400" />
              {worker.phone}
            </p>
          )}
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge
            on={booking.is_confirmed}
            label="Confirmed"
            onClass="border border-emerald-300 bg-emerald-100 text-emerald-800"
          />
          <StatusBadge
            on={booking.worker_signed}
            label="Signed"
            onClass="border border-primary/30 bg-primary/10 text-primary"
          />
        </div>
      </div>

      {/* Row 2: qty values + action buttons */}
      <div className="mt-2.5 ml-12 flex items-center gap-3 flex-wrap">
        {/* Farm qty chip */}
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-md">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
            Farm
          </span>
          <span className="text-xs font-bold text-gray-800 tabular-nums">
            {booking.farm_qty != null ? (
              `${Number(booking.farm_qty).toFixed(2)} kg`
            ) : (
              <span className="text-gray-400 font-normal">—</span>
            )}
          </span>
        </div>

        {/* Factory qty chip */}
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-md">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
            Factory
          </span>
          <span className="text-xs font-bold text-gray-800 tabular-nums">
            {booking.factory_qty != null ? (
              `${Number(booking.factory_qty).toFixed(2)} kg`
            ) : (
              <span className="text-gray-400 font-normal">—</span>
            )}
          </span>
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {!booking.is_confirmed && (
            <button
              onClick={() => confirmMutation.mutate(booking.id)}
              disabled={confirmMutation.isPending}
              title="Confirm attendance"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <MdCheck className="w-3 h-3" />
              Confirm
            </button>
          )}

          <button
            onClick={toggleFarmQty}
            disabled={!booking.is_confirmed}
            title="Capture farm quantity"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary text-white border border-primary/80 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <MdScale className="w-3 h-3" />
            Farm Qty
          </button>

          <button
            onClick={toggleFactoryQty}
            disabled={booking.farm_qty == null}
            title="Capture factory quantity"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary text-white border border-primary/80 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <MdScale className="w-3 h-3" />
            Factory Qty
          </button>

          {!booking.worker_signed && (
            <button
              onClick={() => signOffMutation.mutate(booking.id)}
              disabled={
                !booking.is_confirmed ||
                booking.farm_qty == null ||
                booking.factory_qty == null ||
                signOffMutation.isPending
              }
              title="Sign off worker"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary text-white border border-primary/80 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <MdCreate className="w-3 h-3" />
              Sign Off
            </button>
          )}
        </div>
      </div>

      {/* Inline farm qty form */}
      {state.showFarmQty && (
        <div className="mt-2 ml-12 flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.farmQtyInput}
            onChange={(e) =>
              setState((s) => ({ ...s, farmQtyInput: e.target.value }))
            }
            placeholder="Enter kg"
            autoFocus
            className="w-32 px-3 py-1.5 text-sm font-medium bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-gray-400"
          />
          <button
            onClick={submitFarmQty}
            disabled={farmQtyMutation.isPending}
            className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {farmQtyMutation.isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={toggleFarmQty}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Inline factory qty form */}
      {state.showFactoryQty && (
        <div className="mt-2 ml-12 flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.factoryQtyInput}
            onChange={(e) =>
              setState((s) => ({ ...s, factoryQtyInput: e.target.value }))
            }
            placeholder="Enter kg"
            autoFocus
            className="w-32 px-3 py-1.5 text-sm font-medium bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-gray-400"
          />
          <button
            onClick={submitFactoryQty}
            disabled={factoryQtyMutation.isPending}
            className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {factoryQtyMutation.isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={toggleFactoryQty}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */
export default function ScheduleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading } = useSchedule(id);
  const cancelSchedule = useCancelSchedule();

  /* single mutation instances — passed down to WorkerRows */
  const confirmMutation = useConfirmAttendance();
  const farmQtyMutation = useCaptureFarmQuantity();
  const factoryQtyMutation = useCaptureFactoryQuantity();
  const signOffMutation = useWorkerSignOff();

  const schedule = scheduleResponse?.data;
  const bookings = schedule?.bookings?.data ?? [];
  const bookingsCount = schedule?.bookings_count ?? 0;

  /* ── loading ── */
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

  /* ── not found ── */
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

  /* ── derived values ── */
  const scheduledDate = new Date(schedule.scheduled_date);
  const createdDate = new Date(schedule.created_at);

  const confirmedCount = bookings.filter((b) => b.is_confirmed).length;
  const signedCount = bookings.filter((b) => b.worker_signed).length;
  const withQuantitiesCount = bookings.filter((b) => b.farm_qty != null).length;

  const pct = (n: number) =>
    bookings.length > 0 ? Math.round((n / bookings.length) * 100) : 0;

  const confirmPct = pct(confirmedCount);
  const signedPct = pct(signedCount);
  const yieldPct = pct(withQuantitiesCount);

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
      {/* ══════════════════════════════════
          Sticky Topbar
          ══════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* left: back + title + badge + ref */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/schedules"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-extrabold text-gray-900 truncate">
                  {schedule.activity.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_STYLES[schedule.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {statusLabel(schedule.status)}
                </span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(schedule.reference_code)
                  }
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors shrink-0 group"
                  title="Copy reference code"
                >
                  <span className="text-[10px] font-mono font-semibold text-gray-600 group-hover:text-gray-800">
                    {schedule.reference_code}
                  </span>
                  <MdContentCopy className="w-2.5 h-2.5 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">
                {schedule.farm.name} &middot; {schedule.farm.zone.name}
              </p>
            </div>
          </div>

          {/* right: action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {schedule.status !== "cancelled" && (
              <button
                onClick={() => cancelSchedule.mutate(id)}
                disabled={cancelSchedule.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 hover:bg-orange-200 disabled:opacity-50 transition-colors"
              >
                <MdCancel className="w-3.5 h-3.5" />
                {cancelSchedule.isPending ? "Cancelling…" : "Cancel"}
              </button>
            )}
            <Link
              href={`/schedules/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <MdEdit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          Stats Bar
          ══════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Workers",
              value: bookingsCount,
              icon: MdPeople,
            },
            {
              label: "Confirmed",
              value: confirmedCount,
              icon: MdCheckCircle,
            },
            {
              label: "Worker Signed",
              value: signedCount,
              icon: MdCreate,
            },
            {
              label: "With Yield",
              value: withQuantitiesCount,
              icon: MdScale,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary/70" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">
                  {value}
                </p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          Main Two-Column Cards
          ══════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
          {/* ── Left Card: Schedule Details ── */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <MdCalendarToday className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-600">
                  Schedule Details
                </h2>
              </div>

              <div className="px-5 py-5 grid grid-cols-2 gap-x-6 gap-y-5 flex-1">
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
                <InfoTile icon={MdAccessTime} label="Time" value={humanTime} />
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
                    className="col-span-2"
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
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <MdNotes className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                    Notes
                  </span>
                </div>
                {schedule.notes ? (
                  <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    {schedule.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No notes recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Card: Booked Workers ── */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
              {/* Workers card header — single row with title + mini rings + progress bars */}
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Title + count */}
                  <div className="flex items-center gap-2 shrink-0">
                    <MdPeople className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-600">
                      Booked Workers
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                      {bookingsCount}
                    </span>
                  </div>

                  {bookings.length > 0 && (
                    <>
                      {/* Mini progress rings */}
                      <div className="flex items-center gap-4">
                        <MiniRing
                          value={confirmPct}
                          color="#10b981"
                          trackColor="#d1fae5"
                          label="Confirmed"
                        />
                        <MiniRing
                          value={signedPct}
                          color="#3b82f6"
                          trackColor="#dbeafe"
                          label="Signed"
                        />
                        <MiniRing
                          value={yieldPct}
                          color="#f59e0b"
                          trackColor="#fef3c7"
                          label="Yield"
                        />
                      </div>

                      {/* Progress bars */}
                      <div className="flex flex-col gap-1.5 ml-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-semibold w-16">
                            Confirmed
                          </span>
                          <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${confirmPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold tabular-nums w-10">
                            {confirmedCount}/{bookings.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-semibold w-16">
                            Signed
                          </span>
                          <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${signedPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-blue-700 font-bold tabular-nums w-10">
                            {signedCount}/{bookings.length}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable rows — flex-1 ensures equal height with left card */}
              {bookings.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <MdPeople className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No workers assigned to this schedule yet.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
