// app/schedules/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdCancel,
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
  MdSave,
} from "react-icons/md";
import { useSchedule } from "@/hooks/useSchedule";
import {
  useCaptureFarmQuantity,
  useCaptureFactoryQuantity,
  useWorkerSignOff,
  useSubmitPaymentToFarmer,
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

// BatchWorkersTable component - For Record Farm Kgs tab
interface BatchChanges {
  farm_qty: Record<string, number | null>;
  factory_qty: Record<string, number | null>;
  attendance: Record<string, boolean>;
}

const BatchWorkersTable = ({ bookings, farmQtyMutation, factoryQtyMutation, signOffMutation, submitPaymentMutation, onSaveComplete }: any) => {
  const [changes, setChanges] = useState<BatchChanges>({
    farm_qty: {},
    factory_qty: {},
    attendance: {},
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleFarmChange = (bookingId: string, value: string) => {
    const num = value === "" ? null : parseFloat(value);
    setChanges((prev) => ({
      ...prev,
      farm_qty: { ...prev.farm_qty, [bookingId]: isNaN(num as number) ? null : num },
    }));
  };

  const handleFactoryChange = (bookingId: string, value: string) => {
    const num = value === "" ? null : parseFloat(value);
    setChanges((prev) => ({
      ...prev,
      factory_qty: { ...prev.factory_qty, [bookingId]: isNaN(num as number) ? null : num },
    }));
  };

  const handleAttendanceChange = (bookingId: string, value: boolean) => {
    setChanges((prev) => ({
      ...prev,
      attendance: { ...prev.attendance, [bookingId]: value },
    }));
  };

  const handleSignOff = async (bookingId: string) => {
    try {
      await signOffMutation.mutateAsync(bookingId);
      onSaveComplete();
    } catch (err) {
      console.error("Failed to sign off:", err);
    }
  };

  const saveAll = async () => {
    const farmUpdates = Object.entries(changes.farm_qty).filter(([, qty]) => qty !== null && qty !== undefined);
    const factoryUpdates = Object.entries(changes.factory_qty).filter(([, qty]) => qty !== null && qty !== undefined);
    const attendanceUpdates = Object.entries(changes.attendance);
    
    if (farmUpdates.length === 0 && factoryUpdates.length === 0 && attendanceUpdates.length === 0) {
      alert("No changes to save");
      return;
    }

    setIsSaving(true);
    const errors: string[] = [];

    for (const [bookingId, attended] of attendanceUpdates) {
      try {
        const currentAttendance = bookings.find((b: any) => b.id === bookingId)?.is_confirmed;
        if (attended && !currentAttendance) {
          await farmQtyMutation.mutateAsync({ id: bookingId, farm_qty: 0 });
        }
      } catch (err: any) {
        errors.push(`Attendance for booking ${bookingId}: ${err.message}`);
      }
    }

    for (const [bookingId, qty] of farmUpdates) {
      try {
        await farmQtyMutation.mutateAsync({ id: bookingId, farm_qty: qty! });
      } catch (err: any) {
        errors.push(`Farm qty for booking ${bookingId}: ${err.message}`);
      }
    }
    for (const [bookingId, qty] of factoryUpdates) {
      try {
        await factoryQtyMutation.mutateAsync({ id: bookingId, factory_qty: qty! });
      } catch (err: any) {
        errors.push(`Factory qty for booking ${bookingId}: ${err.message}`);
      }
    }

    setIsSaving(false);
    if (errors.length > 0) {
      alert(`Some updates failed:\n${errors.join("\n")}`);
    } else {
      alert("All changes saved successfully!");
      setChanges({ farm_qty: {}, factory_qty: {}, attendance: {} });
      onSaveComplete();
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Worker</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Farm Kg</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Factory Kg</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {bookings.map((booking: ScheduleBooking) => {
              const worker = booking.worker;
              const currentFarm = changes.farm_qty[booking.id] ?? booking.farm_qty ?? "";
              const currentFactory = changes.factory_qty[booking.id] ?? booking.factory_qty ?? "";
              const currentAttendance = changes.attendance[booking.id] !== undefined ? changes.attendance[booking.id] : booking.is_confirmed;
              return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{worker?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{worker?.phone || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleAttendanceChange(booking.id, !currentAttendance)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors shadow-sm ${
                        currentAttendance
                          ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                          : "bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {currentAttendance ? <MdCheckCircle className="w-3 h-3" /> : <MdRadioButtonUnchecked className="w-3 h-3" />}
                      {currentAttendance ? "Confirmed" : "Confirm"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentFarm === null ? "" : currentFarm}
                      onChange={(e) => handleFarmChange(booking.id, e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="kg"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentFactory === null ? "" : currentFactory}
                      onChange={(e) => handleFactoryChange(booking.id, e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="kg"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {!booking.worker_signed ? (
                      <button
                        onClick={() => handleSignOff(booking.id)}
                        disabled={signOffMutation.isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary text-white border border-primary/80 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        <MdCreate className="w-3 h-3" /> Sign Off
                      </button>
                    ) : booking.worker_signed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <MdCheckCircle className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
        <button
          onClick={async () => {
            for (const booking of bookings) {
              try {
                await submitPaymentMutation.mutateAsync(booking.id);
              } catch (err) {
                console.error(`Failed to submit payment for booking ${booking.id}:`, err);
              }
            }
            onSaveComplete();
          }}
          disabled={submitPaymentMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-sm disabled:opacity-50"
        >
          {submitPaymentMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <MdCheck className="w-4 h-4" />
          )}
          Submit to Farmer
        </button>
        <button
          onClick={saveAll}
          disabled={isSaving || (Object.keys(changes.farm_qty).length === 0 && Object.keys(changes.factory_qty).length === 0 && Object.keys(changes.attendance).length === 0)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow-sm"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSave className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
};

export default function ScheduleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: scheduleResponse, isLoading, refetch } = useSchedule(id);

  const farmQtyMutation = useCaptureFarmQuantity();
  const factoryQtyMutation = useCaptureFactoryQuantity();
  const signOffMutation = useWorkerSignOff();
  const submitPaymentMutation = useSubmitPaymentToFarmer();

  

  const schedule = scheduleResponse?.data;
  const bookings = schedule?.bookings?.data ?? [];
  const bookingsCount = schedule?.bookings_count ?? 0;

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
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Left Card: Schedule Details - Fixed minimum width */}
            <div className="lg:w-72 xl:w-80 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
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

            {/* Right Card: Booked Workers with Mode Toggle - Takes remaining space */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
                <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 shrink-0">
                      <MdPeople className="w-4 h-4 text-primary" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-600">Booked Workers</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{bookingsCount}</span>
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
                ) : (
                  <BatchWorkersTable
                    bookings={bookings}
                    farmQtyMutation={farmQtyMutation}
                    factoryQtyMutation={factoryQtyMutation}
                    signOffMutation={signOffMutation}
                    submitPaymentMutation={submitPaymentMutation}
                    onSaveComplete={() => refetch()}
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