"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdBookOnline, MdAdd, MdSearch } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import { useBookings, useDeleteBooking } from "@/hooks/useBooking";
import type { Booking } from "@/types/booking";

export default function BookingsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data, isLoading, error } = useBookings({
    page,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const deleteBooking = useDeleteBooking();

  const bookings = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Modal>
      <div className="min-h-screen p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MdBookOnline className="w-6 h-6 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
              <p className="text-sm text-gray-500">
                Manage worker bookings for schedules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                disabled
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 bg-gray-50"
              />
            </div>
            <Button
              type="small"
              to="/bookings/new"
              className="flex items-center gap-1"
            >
              <MdAdd className="w-4 h-4" />
              Add Booking
            </Button>
          </div>
        </div>
        <div className="space-y-4">
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

          {!isLoading && bookings.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MdBookOnline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first booking.
              </p>
            </div>
          )}

          {bookings.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/bookings/${booking.id}`)}>
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
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Tooltip content="View booking details">
                              <button
                                onClick={() => router.push(`/bookings/${booking.id}`)}
                                className="p-1.5 text-primary/70 bg-primary/5 hover:text-primary hover:bg-primary/15 rounded-lg transition-all"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Edit booking">
                              <button
                                onClick={() => router.push(`/bookings/${booking.id}/edit`)}
                                className="p-1.5 text-blue-500/70 bg-blue-50 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Modal.Open opens="delete-booking">
                              <Tooltip content="Delete booking">
                                <button
                                  onClick={() => setSelectedBooking(booking)}
                                  className="p-1.5 text-red-400/70 bg-red-50 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                >
                                  <FiTrash className="h-4 w-4" />
                                </button>
                              </Tooltip>
                            </Modal.Open>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {pagination.current_page} of {pagination.total_pages} (
                    {pagination.total_items} items)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.current_page <= 1}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.next_page}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
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
