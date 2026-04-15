"use client";

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
  MdPhone,
  MdNotes,
  MdPeople,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdScale,
} from "react-icons/md";
import { useSchedule, useCancelSchedule } from "@/hooks/useSchedule";
import type { ScheduleBooking } from "@/types/schedule";

/* ── helpers ── */
const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-700",
  approved:  "bg-green-100  text-green-700",
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
      <div className="text-sm font-medium text-gray-800 leading-snug">{value}</div>
    </div>
  );
}

function StatusDot({ on, label, onColor }: { on: boolean; label: string; onColor: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
        on ? onColor : "bg-gray-100 text-gray-400"
      }`}
    >
      {on ? (
        <MdCheckCircle className="w-3 h-3" />
      ) : (
        <MdRadioButtonUnchecked className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function WorkerRow({ booking }: { booking: ScheduleBooking }) {
  const worker = booking.worker;
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
      {/* Avatar + identity */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">
            {initials(worker?.name ?? "?")}
          </span>
        </div>
        <div className="min-w-0">
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
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <StatusDot on={booking.is_confirmed} label="Confirmed" onColor="bg-green-100 text-green-700" />
        <StatusDot on={booking.worker_signed} label="Signed" onColor="bg-blue-100 text-blue-700" />
      </div>

      {/* Yield metrics */}
      <div className="flex items-center gap-4 flex-shrink-0 text-right">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Farm Qty</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            {booking.farm_qty != null ? `${booking.farm_qty} kg` : <span className="text-gray-300 font-normal">—</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Factory Qty</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            {booking.factory_qty != null ? `${booking.factory_qty} kg` : <span className="text-gray-300 font-normal">—</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── main page ── */
export default function ScheduleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading } = useSchedule(id);
  const cancelSchedule = useCancelSchedule();

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
          <h2 className="text-base font-semibold text-gray-800 mb-1">Schedule not found</h2>
          <p className="text-sm text-gray-500 mb-4">This schedule doesn&apos;t exist or has been removed.</p>
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
  const createdDate   = new Date(schedule.created_at);

  const confirmedCount      = bookings.filter((b) => b.is_confirmed).length;
  const signedCount         = bookings.filter((b) => b.worker_signed).length;
  const withQuantitiesCount = bookings.filter((b) => b.farm_qty != null).length;

  const humanDate = scheduledDate.toLocaleDateString("en-KE", {
    year: "numeric", month: "long", day: "numeric",
  });
  const humanTime = scheduledDate.toLocaleTimeString("en-KE", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${STATUS_STYLES[schedule.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {statusLabel(schedule.status)}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(schedule.reference_code)}
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

      {/* ── Page Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Stat Pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Workers",  value: bookingsCount,      color: "bg-blue-50   border-blue-100   text-blue-700"   },
            { label: "Confirmed",      value: confirmedCount,     color: "bg-green-50  border-green-100  text-green-700"  },
            { label: "Worker Signed",  value: signedCount,        color: "bg-purple-50 border-purple-100 text-purple-700" },
            { label: "With Yield",     value: withQuantitiesCount,color: "bg-amber-50  border-amber-100  text-amber-700"  },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1 opacity-80">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Details Grid ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdCalendarToday className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Schedule Details</h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <InfoTile
              icon={MdAgriculture}
              label="Activity"
              value={schedule.activity.name}
            />
            <InfoTile
              icon={MdCalendarToday}
              label="Scheduled Date"
              value={humanDate}
            />
            <InfoTile
              icon={MdAccessTime}
              label="Scheduled Time"
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
                value={`${schedule.farm.area} ha`}
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
              />
            )}
            <InfoTile
              icon={MdCalendarToday}
              label="Created At"
              value={createdDate.toLocaleDateString("en-KE", {
                year: "numeric", month: "long", day: "numeric",
              })}
            />
          </div>

          {/* Notes row — full width */}
          <div className="px-6 pb-5 border-t border-gray-50 pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <MdNotes className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes</span>
            </div>
            {schedule.notes ? (
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                {schedule.notes}
              </p>
            ) : (
              <p className="text-sm text-gray-300 italic">No notes recorded yet.</p>
            )}
          </div>
        </div>

        {/* ── Assigned Workers ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdPeople className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Assigned Workers
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                {bookingsCount}
              </span>
            </div>
            {bookings.length > 0 && (
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-green-600 font-medium">
                  {confirmedCount} confirmed
                </span>
                <span className="text-blue-600 font-medium">
                  {signedCount} signed
                </span>
              </div>
            )}
          </div>

          {/* column header strip */}
          {bookings.length > 0 && (
            <div className="hidden sm:flex items-center gap-4 px-6 py-2 bg-gray-50/70 border-b border-gray-100">
              <div className="flex-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Worker</div>
              <div className="flex-shrink-0 w-44 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</div>
              <div className="flex-shrink-0 flex gap-4">
                <span className="w-20 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Farm Qty</span>
                <span className="w-22 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Factory Qty</span>
              </div>
            </div>
          )}

          {/* rows */}
          {bookings.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <MdPeople className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No workers assigned to this schedule yet.</p>
            </div>
          ) : (
            <div>
              {bookings.map((booking) => (
                <WorkerRow key={booking.id} booking={booking} />
              ))}
            </div>
          )}

          {/* summary footer */}
          {bookings.length > 0 && (
            <div className="px-6 py-3 bg-gray-50/60 border-t border-gray-100 flex flex-wrap gap-4 text-[11px]">
              <span className="text-gray-500">
                Confirmation rate:{" "}
                <strong className="text-gray-800">
                  {Math.round((confirmedCount / bookings.length) * 100)}%
                </strong>
              </span>
              <span className="text-gray-500">
                Sign rate:{" "}
                <strong className="text-gray-800">
                  {Math.round((signedCount / bookings.length) * 100)}%
                </strong>
              </span>
              <span className="text-gray-500">
                Yield recorded:{" "}
                <strong className="text-gray-800">
                  {Math.round((withQuantitiesCount / bookings.length) * 100)}%
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}