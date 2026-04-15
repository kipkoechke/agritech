"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdCheckCircle,
  MdEdit,
  MdRadioButtonUnchecked,
  MdPhone,
  MdLocationOn,
  MdAgriculture,
  MdCalendarToday,
  MdAccessTime,
  MdScale,
  MdBadge,
  MdCreate,
} from "react-icons/md";
import {
  useBooking,
  useConfirmAttendance,
  useCaptureFarmQuantity,
  useCaptureFactoryQuantity,
  useWorkerSignOff,
} from "@/hooks/useBooking";

/* ── helpers ── */
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
  muted = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
          {label}
        </span>
      </div>
      <div
        className={`text-[15px] font-medium leading-snug tracking-[-0.01em] ${
          muted ? "text-gray-400 italic text-sm font-normal" : "text-[#111827]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusStep({
  done,
  label,
  doneColor,
}: {
  done: boolean;
  label: string;
  doneColor: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        done
          ? doneColor
          : "border-dashed border-gray-200 bg-transparent text-gray-400"
      }`}
    >
      {done ? (
        <MdCheckCircle className="w-3.5 h-3.5" />
      ) : (
        <MdRadioButtonUnchecked className="w-3.5 h-3.5 opacity-40" />
      )}
      {label}
    </span>
  );
}

function QtyCard({
  label,
  value,
  pending,
  onEdit,
  showForm,
  input,
  onInput,
  onSave,
  onCancel,
  saving,
  color,
}: {
  label: string;
  value: number | null;
  pending: boolean;
  onEdit: () => void;
  showForm: boolean;
  input: string;
  onInput: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
          {label}
        </span>
        {!showForm && (
          <button
            onClick={onEdit}
            className="text-[11px] font-semibold text-primary hover:text-primary/70 transition-colors"
          >
            {value !== null ? "Update" : "Add"}
          </button>
        )}
      </div>

      {!showForm ? (
        value !== null ? (
          <div className="flex items-end gap-1.5">
            <span className={`text-3xl font-bold tracking-[-0.02em] ${color}`}>
              {Number(value).toFixed(2)}
            </span>
            <span className="text-sm text-[#6B7280] mb-0.5 font-medium">
              kg
            </span>
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">Pending Weighing</p>
        )
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            step="0.01"
            value={input}
            onChange={(e) => onInput(e.target.value)}
            placeholder="Enter kg"
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-gray-900"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving || !input}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── page ── */
export default function BookingDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: bookingResponse, isLoading } = useBooking(id);
  const confirmAttendance = useConfirmAttendance();
  const captureFarmQty = useCaptureFarmQuantity();
  const captureFactoryQty = useCaptureFactoryQuantity();
  const workerSignOff = useWorkerSignOff();

  const [farmQtyInput, setFarmQtyInput] = useState("");
  const [factoryQtyInput, setFactoryQtyInput] = useState("");
  const [showFarmQtyForm, setShowFarmQtyForm] = useState(false);
  const [showFactoryQtyForm, setShowFactoryQtyForm] = useState(false);

  const booking = bookingResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading booking…</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen p-6 bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Booking not found
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This booking doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const scheduledDate = new Date(booking.schedule.scheduled_date);
  const humanDate = scheduledDate.toLocaleDateString("en-KE", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const humanTime = scheduledDate.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/bookings"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
          >
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <Link
            href={`/bookings/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Hero card ── */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-emerald-700 tracking-tight">
                {initials(booking.worker.name)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Worker name */}
              <h1 className="text-xl font-bold text-[#111827] tracking-[-0.01em]">
                {booking.worker.name}
              </h1>
              {/* Activity + ref */}
              <p className="text-sm text-[#6B7280] mt-0.5">
                {booking.schedule.activity.name}
                <span className="mx-2 opacity-40">·</span>
                <span className="font-mono text-xs">
                  {booking.schedule.reference_code}
                </span>
              </p>

              {/* Status tracker */}
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusStep
                  done={booking.is_confirmed}
                  label={
                    booking.is_confirmed ? "Confirmed" : "Pending Confirmation"
                  }
                  doneColor="border-emerald-200 bg-emerald-50 text-emerald-700"
                />
                <StatusStep
                  done={booking.worker_signed}
                  label={
                    booking.worker_signed ? "Signed" : "Awaiting Signature"
                  }
                  doneColor="border-blue-200 bg-blue-50 text-blue-600"
                />
                {booking.farm_qty !== null && (
                  <StatusStep
                    done
                    label="Yield Recorded"
                    doneColor="border-amber-200 bg-amber-50 text-amber-700"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Three-column grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column A — Work Context */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
              Work Context
            </p>
            <InfoTile
              icon={MdAgriculture}
              label="Farm"
              value={booking.schedule.farm.name}
            />
            <InfoTile
              icon={MdLocationOn}
              label="Zone"
              value={booking.schedule.farm.zone.name}
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
              icon={MdScale}
              label="Schedule Status"
              value={
                <span className="capitalize">{booking.schedule.status}</span>
              }
            />
          </div>

          {/* Column B — Worker Contact */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
              Worker Contact
            </p>
            <InfoTile
              icon={MdPhone}
              label="Phone"
              value={
                <div className="flex flex-col gap-2 mt-0.5">
                  <span className="text-[15px] font-medium text-[#111827]">
                    {booking.worker.phone}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${booking.worker.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <MdPhone className="w-3 h-3" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${booking.worker.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              }
            />
            <InfoTile
              icon={MdBadge}
              label="Worker ID"
              value={
                <span className="font-mono text-xs text-gray-400 select-all">
                  {booking.worker.id}
                </span>
              }
              muted
            />
          </div>

          {/* Column C — Yield & Metrics */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
              Yield &amp; Metrics
            </p>
            <QtyCard
              label="Farm Quantity"
              value={booking.farm_qty}
              pending={false}
              onEdit={() => setShowFarmQtyForm(true)}
              showForm={showFarmQtyForm}
              input={farmQtyInput}
              onInput={setFarmQtyInput}
              onSave={() => {
                const qty = parseFloat(farmQtyInput);
                if (!isNaN(qty)) {
                  captureFarmQty.mutate(
                    { id, farm_qty: qty },
                    {
                      onSuccess: () => {
                        setShowFarmQtyForm(false);
                        setFarmQtyInput("");
                      },
                    },
                  );
                }
              }}
              onCancel={() => {
                setShowFarmQtyForm(false);
                setFarmQtyInput("");
              }}
              saving={captureFarmQty.isPending}
              color="text-emerald-600"
            />
            <QtyCard
              label="Factory Quantity"
              value={booking.factory_qty}
              pending={false}
              onEdit={() => setShowFactoryQtyForm(true)}
              showForm={showFactoryQtyForm}
              input={factoryQtyInput}
              onInput={setFactoryQtyInput}
              onSave={() => {
                const qty = parseFloat(factoryQtyInput);
                if (!isNaN(qty)) {
                  captureFactoryQty.mutate(
                    { id, factory_qty: qty },
                    {
                      onSuccess: () => {
                        setShowFactoryQtyForm(false);
                        setFactoryQtyInput("");
                      },
                    },
                  );
                }
              }}
              onCancel={() => {
                setShowFactoryQtyForm(false);
                setFactoryQtyInput("");
              }}
              saving={captureFactoryQty.isPending}
              color="text-blue-600"
            />
          </div>
        </div>

        {/* ── Actions bar ── */}
        {(!booking.is_confirmed || !booking.worker_signed) && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] px-6 py-4 flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6B7280] mr-auto">
              Actions
            </p>
            {!booking.is_confirmed && (
              <button
                onClick={() => confirmAttendance.mutate(id)}
                disabled={confirmAttendance.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <MdCheckCircle className="w-4 h-4" />
                {confirmAttendance.isPending
                  ? "Confirming…"
                  : "Confirm Attendance"}
              </button>
            )}
            {!booking.worker_signed && (
              <button
                onClick={() => workerSignOff.mutate(id)}
                disabled={workerSignOff.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <MdCreate className="w-4 h-4" />
                {workerSignOff.isPending ? "Signing off…" : "Worker Sign Off"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
