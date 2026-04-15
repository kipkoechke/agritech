"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdBookOnline,
  MdAdd,
  MdSearch,
  MdCheckCircle,
  MdPending,
} from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import PageHeader from "@/components/common/PageHeader";
import {
  useBookings,
  useDeleteBooking,
  useConfirmAttendance,
} from "@/hooks/useBooking";
import type { Booking } from "@/types/booking";

export default function BookingsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<"book" | "confirm">("book");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useBookings({
    page,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const deleteBooking = useDeleteBooking();
  const confirmAttendance = useConfirmAttendance();

  const bookings = data?.data || [];
  const pagination = data?.pagination;

  // Filter bookings by tab
  const unconfirmedBookings = bookings.filter((b) => !b.is_confirmed);
  const confirmedBookings = bookings.filter((b) => b.is_confirmed);
  const displayBookings =
    activeTab === "book" ? unconfirmedBookings : confirmedBookings;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayBookings.map((b) => b.id)));
    }
  };

  const handleBulkConfirm = async () => {
    for (const id of selectedIds) {
      await confirmAttendance.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  return (
    <Modal>
      <div className="min-h-screen p-4 space-y-4">
        <PageHeader
          title="Bookings"
          search={
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                disabled
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 bg-gray-50"
              />
            </div>
          }
          action={
            <Button
              type="small"
              to="/bookings/new"
              className="flex items-center gap-1"
            >
              <MdAdd className="w-4 h-4" />
              Add Booking
            </Button>
          }
        />
        <div className="space-y-4">
          {/* Book / Confirm Tabs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 flex items-center justify-between px-4">
              <nav className="flex -mb-px">
                <button
                  onClick={() => {
                    setActiveTab("book");
                    setSelectedIds(new Set());
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === "book"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MdPending className="w-4 h-4" />
                  Book ({unconfirmedBookings.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("confirm");
                    setSelectedIds(new Set());
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === "confirm"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MdCheckCircle className="w-4 h-4" />
                  Confirmed ({confirmedBookings.length})
                </button>
              </nav>
              {activeTab === "book" && selectedIds.size > 0 && (
                <button
                  onClick={handleBulkConfirm}
                  disabled={confirmAttendance.isPending}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <MdCheckCircle className="w-4 h-4" />
                  Confirm Selected ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              Failed to load bookings. Please try again later.
            </div>
          )}

          {!isLoading && displayBookings.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MdBookOnline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "book"
                  ? "No unconfirmed bookings"
                  : "No confirmed bookings"}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === "book"
                  ? "All bookings have been confirmed."
                  : "No bookings have been confirmed yet."}
              </p>
            </div>
          )}

          {displayBookings.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/60">
                    <tr>
                      {activeTab === "book" && (
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedIds.size === displayBookings.length &&
                              displayBookings.length > 0
                            }
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Worker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confirmed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farm Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Factory Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                      >
                        {activeTab === "book" && (
                          <td
                            className="px-4 py-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.has(booking.id)}
                              onChange={() => toggleSelection(booking.id)}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                            {booking.worker?.name ?? "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {booking.worker?.phone ?? "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.schedule?.reference_code ?? "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {booking.schedule?.activity?.name ?? "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {booking.schedule?.farm?.name ?? "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              booking.is_confirmed
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.is_confirmed ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.farm_qty ?? "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.factory_qty ?? "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip content="View booking details">
                              <button
                                onClick={() =>
                                  router.push(`/bookings/${booking.id}`)
                                }
                                className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              >
                                <FiEye className="h-3.5 w-3.5" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Edit booking">
                              <button
                                onClick={() =>
                                  router.push(`/bookings/${booking.id}/edit`)
                                }
                                className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              >
                                <FiEdit className="h-3.5 w-3.5" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete booking">
                              <Modal.Open opens="delete-booking">
                                <button
                                  onClick={() => setSelectedBooking(booking)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                >
                                  <FiTrash className="h-3.5 w-3.5" />
                                </button>
                              </Modal.Open>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Page {pagination.current_page} of {pagination.total_pages}{" "}
                    &nbsp;·&nbsp; {pagination.total_items} items
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.current_page <= 1}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.next_page}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Modal.Window name="delete-booking">
          {selectedBooking ? (
            <DeleteConfirmationModal
              itemName={`${selectedBooking.worker.name} — ${selectedBooking.schedule.reference_code}`}
              itemType="Booking"
              onConfirm={() => deleteBooking.mutateAsync(selectedBooking.id)}
              isDeleting={deleteBooking.isPending}
            />
          ) : (
            <div />
          )}
        </Modal.Window>
      </div>
    </Modal>
  );
}
