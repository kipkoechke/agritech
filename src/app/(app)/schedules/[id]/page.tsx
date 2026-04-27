// app/schedules/[id]/page.tsx
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
  MdViewList,
  MdTableView,
  MdSave,
} from "react-icons/md";
import { useSchedule, useCancelSchedule } from "@/hooks/useSchedule";
import {
  useConfirmAttendance,
  useCaptureFarmQuantity,
  useCaptureFactoryQuantity,
  useWorkerSignOff,
} from "@/hooks/useBooking";
import type { ScheduleBooking } from "@/types/schedule";
import ErrorBoundary from "@/components/common/ErrorBoundary"; // <-- import

/* ── helpers & styles ── */

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Active';
    case 'cancelled': return 'Cancelled';
    case 'completed': return 'Completed';
    case 'pending': return 'Pending';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// InfoTile component
const InfoTile = ({ icon: Icon, label, value, className = "" }: { icon: any; label: string; value: string; className?: string }) => (
  <div className={className}>
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
      </div>
    </div>
  </div>
);

// WorkerRow component
const WorkerRow = ({ booking, confirmMutation, farmQtyMutation, factoryQtyMutation, signOffMutation }: { booking: ScheduleBooking; confirmMutation: any; farmQtyMutation: any; factoryQtyMutation: any; signOffMutation: any }) => (
  <div className="px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{booking.worker?.name || "—"}</p>
        <p className="text-xs text-gray-500">{booking.worker?.phone || "—"}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => confirmMutation.mutate(booking.id)} className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800 hover:bg-blue-200">Confirm</button>
        <button onClick={() => signOffMutation.mutate(booking.id)} className="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-800 hover:bg-green-200">Sign Off</button>
      </div>
    </div>
  </div>
);

// BatchWorkersTable component
const BatchWorkersTable = ({ bookings, farmQtyMutation, factoryQtyMutation, onSaveComplete, confirmPct, signedPct, yieldPct, confirmedCount, signedCount, totalWorkers }: any) => (
  <div className="px-5 py-4">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Confirmed: {confirmPct}%</span>
        <span className="text-xs text-gray-500">{confirmedCount}/{totalWorkers}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Signed: {signedPct}%</span>
        <span className="text-xs text-gray-500">{signedCount}/{totalWorkers}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">With Yield: {yieldPct}%</span>
      </div>
    </div>
  </div>
);

export default function ScheduleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading, refetch } = useSchedule(id);
  const cancelSchedule = useCancelSchedule();

  const confirmMutation = useConfirmAttendance();
  const farmQtyMutation = useCaptureFarmQuantity();
  const factoryQtyMutation = useCaptureFactoryQuantity();
  const signOffMutation = useWorkerSignOff();

  const [mode, setMode] = useState<"individual" | "batch">("individual");

  const schedule = scheduleResponse?.data;
  const bookings = schedule?.bookings?.data ?? [];
  const bookingsCount = schedule?.bookings_count ?? 0;

  // Compute indicator values
  const confirmedCount = bookings.filter((b) => b.is_confirmed).length;
  const signedCount = bookings.filter((b) => b.worker_signed).length;
  const withQuantitiesCount = bookings.filter((b) => b.farm_qty != null).length;
  const pct = (n: number) => (bookings.length > 0 ? Math.round((n / bookings.length) * 100) : 0);
  const confirmPct = pct(confirmedCount);
  const signedPct = pct(signedCount);
  const yieldPct = pct(withQuantitiesCount);

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

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">Schedule not found</h2>
          <p className="text-sm text-gray-500 mb-4">This schedule doesn&apos;t exist or has been removed.</p>
          <Link href="/schedules" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <MdArrowBack className="w-4 h-4" /> Back to Schedules
          </Link>
        </div>
      </div>
    );
  }

  const scheduledDate = new Date(schedule.scheduled_date);
  const createdDate = new Date(schedule.created_at);
  const humanDate = scheduledDate.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
  const humanTime = scheduledDate.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  const summary = schedule.bookings_summary;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Topbar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/schedules" className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-extrabold text-gray-900 truncate">{schedule.activity?.name || "—"}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_STYLES[schedule.status as keyof typeof STATUS_STYLES] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabel(schedule.status)}
                  </span>
                  <button onClick={() => navigator.clipboard.writeText(schedule.reference_code)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors shrink-0 group">
                    <span className="text-[10px] font-mono font-semibold text-gray-600 group-hover:text-gray-800">{schedule.reference_code}</span>
                    <MdContentCopy className="w-2.5 h-2.5 text-gray-500 group-hover:text-gray-700" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">{schedule.farm?.name || "—"} &middot; {schedule.farm?.zone?.name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {schedule.status !== "cancelled" && (
                <button onClick={() => cancelSchedule.mutate(id)} disabled={cancelSchedule.isPending} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 hover:bg-orange-200 disabled:opacity-50 transition-colors">
                  <MdCancel className="w-3.5 h-3.5" /> {cancelSchedule.isPending ? "Cancelling…" : "Cancel"}
                </button>
              )}
              <Link href={`/schedules/${id}/edit`} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm">
                <MdEdit className="w-3.5 h-3.5" /> Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {[
                { label: "Farm KGs", value: `${summary.total_farm_kgs} kg`, icon: MdScale },
                { label: "Factory KGs", value: `${summary.total_factory_kgs} kg`, icon: MdScale },
                { label: "Attended", value: summary.attended, icon: MdCheckCircle },
                { label: "Absent", value: summary.absent, icon: MdCancel },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">{value}</p>
                    <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Two-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
            {/* Left Card: Schedule Details */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 shrink-0">
                  <MdCalendarToday className="w-4 h-4 text-primary" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-600">Schedule Details</h2>
                </div>
                <div className="px-5 py-5 grid grid-cols-2 gap-x-6 gap-y-5 flex-1">
                  <InfoTile icon={MdAgriculture} label="Activity" value={schedule.activity?.name || "—"} />
                  <InfoTile icon={MdCalendarToday} label="Date" value={humanDate} />
                  <InfoTile icon={MdAccessTime} label="Time" value={humanTime} />
                  <InfoTile icon={MdLocationOn} label="Farm" value={schedule.farm?.name || "—"} />
                  <InfoTile icon={MdLocationOn} label="Zone" value={schedule.farm?.zone?.name || "—"} />
                  {schedule.farm?.area && <InfoTile icon={MdScale} label="Farm Area" value={`${schedule.farm.area} acres`} />}
                  <InfoTile icon={MdPerson} label="Created By" value={schedule.created_by?.name || "—"} />
                  {schedule.created_by?.email && (
                    <InfoTile icon={MdEmail} label="Creator Email" value={schedule.created_by.email} className="col-span-2" />
                  )}
                  <InfoTile icon={MdCalendarToday} label="Created" value={createdDate.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })} />
                </div>
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 shrink-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MdNotes className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Notes</span>
                  </div>
                  {schedule.notes ? (
                    <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">{schedule.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No notes recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card: Booked Workers with Mode Toggle */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
                <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 shrink-0">
                      <MdPeople className="w-4 h-4 text-primary" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-600">Booked Workers</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{bookingsCount}</span>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                      <button
                        onClick={() => setMode("individual")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          mode === "individual" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <MdViewList className="w-3.5 h-3.5" /> Individual
                      </button>
                      <button
                        onClick={() => setMode("batch")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          mode === "batch" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <MdTableView className="w-3.5 h-3.5" /> Batch Table
                      </button>
                    </div>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <MdPeople className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No workers assigned to this schedule yet.</p>
                  </div>
                ) : mode === "individual" ? (
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
                ) : (
                  <BatchWorkersTable
                    bookings={bookings}
                    farmQtyMutation={farmQtyMutation}
                    factoryQtyMutation={factoryQtyMutation}
                    onSaveComplete={() => refetch()}
                    confirmPct={confirmPct}
                    signedPct={signedPct}
                    yieldPct={yieldPct}
                    confirmedCount={confirmedCount}
                    signedCount={signedCount}
                    totalWorkers={bookings.length}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}