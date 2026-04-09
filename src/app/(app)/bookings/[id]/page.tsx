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
} from "react-icons/md";
import Button from "@/components/common/Button";
import {
  useBooking,
  useConfirmAttendance,
  useCaptureFarmQuantity,
  useCaptureFactoryQuantity,
  useWorkerSignOff,
} from "@/hooks/useBooking";

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
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600 text-center">
          Booking not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-5xl mx-auto">
      {/* Top Bar: Back + Title + Actions */}
      <div className="mb-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <MdArrowBack className="w-4 h-4" />
          Back to Bookings
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MdBookOnline className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {booking.schedule.reference_code}
              </h1>
              <p className="text-sm text-gray-500">
                {booking.schedule.activity.name} &middot;{" "}
                {new Date(booking.schedule.scheduled_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!booking.is_confirmed && (
              <button
                onClick={() => confirmAttendance.mutate(id)}
                disabled={confirmAttendance.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
              >
                <MdCheckCircle className="w-4 h-4" />
                {confirmAttendance.isPending
                  ? "Confirming..."
                  : "Confirm Attendance"}
              </button>
            )}
            {!booking.worker_signed && (
              <button
                onClick={() => workerSignOff.mutate(id)}
                disabled={workerSignOff.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
              >
                <MdCheckCircle className="w-4 h-4" />
                {workerSignOff.isPending ? "Signing off..." : "Worker Sign Off"}
              </button>
            )}
            <Button type="small" to={`/bookings/${id}/edit`}>
              <MdEdit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
            booking.is_confirmed
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${booking.is_confirmed ? "bg-green-500" : "bg-yellow-500"}`}
          />
          {booking.is_confirmed ? "Attendance Confirmed" : "Attendance Pending"}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
            booking.worker_signed
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${booking.worker_signed ? "bg-green-500" : "bg-gray-400"}`}
          />
          {booking.worker_signed ? "Worker Signed Off" : "Not Signed Off"}
        </span>
        {booking.is_confirmed && booking.worker_signed && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
            <MdCheckCircle className="w-3 h-3" />
            All Complete
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Worker & Schedule Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MdPerson className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Worker
                  </h3>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.worker.name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {booking.worker.phone}
                </p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MdSchedule className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Schedule
                  </h3>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.schedule.reference_code}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {booking.schedule.activity.name}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-t border-gray-100">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MdAgriculture className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Farm
                  </h3>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.schedule.farm.name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {booking.schedule.farm.zone.name}
                </p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MdCalendarToday className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </h3>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(booking.schedule.scheduled_date).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quantities */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Quantities
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Farm Quantity */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Farm Quantity
                  </h3>
                  {!showFarmQtyForm && (
                    <button
                      onClick={() => setShowFarmQtyForm(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {booking.farm_qty !== null ? "Update" : "Capture"}
                    </button>
                  )}
                </div>
                {!showFarmQtyForm ? (
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.farm_qty ?? (
                      <span className="text-gray-300">—</span>
                    )}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      value={farmQtyInput}
                      onChange={(e) => setFarmQtyInput(e.target.value)}
                      placeholder="Enter quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
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
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
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
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Factory Quantity
                  </h3>
                  {!showFactoryQtyForm && (
                    <button
                      onClick={() => setShowFactoryQtyForm(true)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {booking.factory_qty !== null ? "Update" : "Capture"}
                    </button>
                  )}
                </div>
                {!showFactoryQtyForm ? (
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.factory_qty ?? (
                      <span className="text-gray-300">—</span>
                    )}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      value={factoryQtyInput}
                      onChange={(e) => setFactoryQtyInput(e.target.value)}
                      placeholder="Enter quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
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
                        disabled={
                          captureFactoryQty.isPending || !factoryQtyInput
                        }
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
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
            </div>
          </div>
        </div>

        {/* Right Column - Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Summary</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Worker</span>
                <span className="text-sm font-medium text-gray-900">
                  {booking.worker.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Activity</span>
                <span className="text-sm font-medium text-gray-900">
                  {booking.schedule.activity.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Farm</span>
                <span className="text-sm font-medium text-gray-900">
                  {booking.schedule.farm.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Zone</span>
                <span className="text-sm font-medium text-gray-900">
                  {booking.schedule.farm.zone.name}
                </span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Farm Qty</span>
                <span className="text-sm font-bold text-gray-900">
                  {booking.farm_qty ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Factory Qty</span>
                <span className="text-sm font-bold text-gray-900">
                  {booking.factory_qty ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
