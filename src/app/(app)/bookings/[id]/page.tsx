// app/bookings/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdBookOnline,
  MdCheckCircle,
  MdEdit,
  MdPerson,
  MdSchedule,
  MdAgriculture,
  MdCalendarToday,
  MdExpandMore,
  MdExpandLess,
  MdPhone,
  MdLocationOn,
  MdVerified,
} from "react-icons/md";
import Button from "@/components/common/Button";
import {
  useBooking,
  useConfirmAttendance,
  useCaptureFarmQuantity,
  useCaptureFactoryQuantity,
  useWorkerSignOff,
} from "@/hooks/useBooking";

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <MdExpandLess className="w-5 h-5 text-gray-400" />
        ) : (
          <MdExpandMore className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
};

// Detail Row Component
const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string | number; icon?: any }) => (
  <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
    <div className="w-32 flex-shrink-0">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
    </div>
    <div className="flex-1">
      <span className="text-sm text-gray-800">{value || "—"}</span>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ confirmed, signed }: { confirmed: boolean; signed: boolean }) => {
  if (confirmed && signed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <MdCheckCircle className="w-3.5 h-3.5" />
        Complete
      </span>
    );
  }
  if (confirmed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        <MdCheckCircle className="w-3.5 h-3.5" />
        Attendance Confirmed
      </span>
    );
  }
  if (signed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
        Worker Signed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
      Pending
    </span>
  );
};

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Booking Not Found</h2>
            <p className="text-red-600">The booking you're looking for doesn't exist.</p>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              <MdArrowBack className="w-4 h-4" />
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const scheduledDate = new Date(booking.schedule.scheduled_date);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/bookings"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <MdBookOnline className="w-6 h-6 text-primary" />
                  <h1 className="text-xl font-bold text-gray-900">
                    {booking.schedule.reference_code}
                  </h1>
                  <StatusBadge 
                    confirmed={booking.is_confirmed} 
                    signed={booking.worker_signed} 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {booking.schedule.activity.name}
                </p>
              </div>
            </div>
            <Button type="small" to={`/bookings/${id}/edit`} className="flex items-center gap-2">
              <MdEdit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Single Form Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Worker Information */}
          <CollapsibleSection title="Worker Information" icon={MdPerson} defaultOpen={true}>
            <DetailRow label="Name" value={booking.worker.name} icon={MdPerson} />
            <DetailRow label="Phone" value={booking.worker.phone} icon={MdPhone} />
          </CollapsibleSection>

          {/* Schedule Details */}
          <CollapsibleSection title="Schedule Details" icon={MdSchedule} defaultOpen={true}>
            <DetailRow label="Reference Code" value={booking.schedule.reference_code} />
            <DetailRow label="Activity" value={booking.schedule.activity.name} />
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
            <DetailRow label="Status" value={booking.schedule.status} />
          </CollapsibleSection>

          {/* Farm Details */}
          <CollapsibleSection title="Farm Details" icon={MdAgriculture} defaultOpen={true}>
            <DetailRow label="Farm Name" value={booking.schedule.farm.name} />
            <DetailRow label="Zone" value={booking.schedule.farm.zone.name} icon={MdLocationOn} />
          </CollapsibleSection>

          {/* Quantities */}
          <CollapsibleSection title="Quantities" icon={MdVerified} defaultOpen={true}>
            {/* Farm Quantity */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Farm Quantity</label>
                {!showFarmQtyForm && (
                  <button
                    onClick={() => setShowFarmQtyForm(true)}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    {booking.farm_qty !== null ? "Update" : "Add"}
                  </button>
                )}
              </div>
              {!showFarmQtyForm ? (
                <p className="text-2xl font-bold text-gray-900">
                  {booking.farm_qty !== null ? `${booking.farm_qty} kg` : "—"}
                </p>
              ) : (
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.01"
                    value={farmQtyInput}
                    onChange={(e) => setFarmQtyInput(e.target.value)}
                    placeholder="Enter quantity in kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
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
                      disabled={captureFarmQty.isPending || !farmQtyInput}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50"
                    >
                      {captureFarmQty.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setShowFarmQtyForm(false);
                        setFarmQtyInput("");
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Factory Quantity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Factory Quantity</label>
                {!showFactoryQtyForm && (
                  <button
                    onClick={() => setShowFactoryQtyForm(true)}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    {booking.factory_qty !== null ? "Update" : "Add"}
                  </button>
                )}
              </div>
              {!showFactoryQtyForm ? (
                <p className="text-2xl font-bold text-gray-900">
                  {booking.factory_qty !== null ? `${booking.factory_qty} kg` : "—"}
                </p>
              ) : (
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.01"
                    value={factoryQtyInput}
                    onChange={(e) => setFactoryQtyInput(e.target.value)}
                    placeholder="Enter quantity in kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
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
                      disabled={captureFactoryQty.isPending || !factoryQtyInput}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50"
                    >
                      {captureFactoryQty.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setShowFactoryQtyForm(false);
                        setFactoryQtyInput("");
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Status & Actions */}
          <CollapsibleSection title="Status & Actions" icon={MdCheckCircle} defaultOpen={true}>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Attendance Confirmed</span>
                <span className={`text-sm font-medium ${booking.is_confirmed ? "text-green-600" : "text-yellow-600"}`}>
                  {booking.is_confirmed ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Worker Signed</span>
                <span className={`text-sm font-medium ${booking.worker_signed ? "text-green-600" : "text-gray-500"}`}>
                  {booking.worker_signed ? "Yes" : "No"}
                </span>
              </div>
              
              <div className="flex gap-3 pt-2">
                {!booking.is_confirmed && (
                  <button
                    onClick={() => confirmAttendance.mutate(id)}
                    disabled={confirmAttendance.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                  >
                    <MdCheckCircle className="w-4 h-4" />
                    {confirmAttendance.isPending ? "Confirming..." : "Confirm Attendance"}
                  </button>
                )}
                {!booking.worker_signed && (
                  <button
                    onClick={() => workerSignOff.mutate(id)}
                    disabled={workerSignOff.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
                  >
                    <MdCheckCircle className="w-4 h-4" />
                    {workerSignOff.isPending ? "Signing off..." : "Worker Sign Off"}
                  </button>
                )}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}