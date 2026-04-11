// app/schedules/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdSchedule,
  MdAdd,
  MdSearch,
  MdCancel,
  MdCalendarViewMonth,
  MdViewList,
  MdEvent,
  MdChevronLeft,
  MdChevronRight,
  MdToday,
} from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ActionMenu } from "@/components/common/ActionMenu";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import {
  useSchedules,
  useDeleteSchedule,
  useCancelSchedule,
} from "@/hooks/useSchedule";
import type { Schedule } from "@/types/schedule";

// Calendar View Component
const CalendarView = ({ schedules }: { schedules: Schedule[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduled_date);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        {/* Calendar */}
        <div className="lg:col-span-2 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <MdToday className="w-4 h-4" />
              Today
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center py-2 text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="min-h-[100px] bg-gray-50 rounded-lg" />;
              }

              const daySchedules = getSchedulesForDate(day);
              const isToday = new Date().toDateString() === day.toDateString();
              const isSelected = selectedDate?.toDateString() === day.toDateString();

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] p-2 rounded-lg border transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : isToday
                      ? "border-primary/50 bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday ? "text-primary" : "text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="text-xs font-medium text-primary">
                        {daySchedules.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {daySchedules.slice(0, 2).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="text-xs truncate px-1.5 py-0.5 rounded bg-gray-100 text-gray-700"
                        title={schedule.reference_code}
                      >
                        {schedule.activity.name}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-xs text-gray-400 px-1.5">
                        +{daySchedules.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MdEvent className="w-5 h-5 text-primary" />
              {selectedDate ? (
                selectedDate.toLocaleDateString("en-KE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                "Select a date"
              )}
            </h3>
          </div>

          {selectedDate && selectedDateSchedules.length === 0 && (
            <div className="text-center py-8">
              <MdSchedule className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No schedules for this date</p>
            </div>
          )}

          {selectedDate && selectedDateSchedules.length > 0 && (
            <div className="space-y-3">
              {selectedDateSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {schedule.reference_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {schedule.activity.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                        schedule.status
                      )}`}
                    >
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Farm:</span> {schedule.farm.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Zone:</span> {schedule.farm.zone.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SchedulesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );

  const { data, isLoading, error } = useSchedules({
    page,
    search: search || undefined,
    status: statusFilter || undefined,
    sort_by: "scheduled_date",
    sort_order: "desc",
  });
  const deleteSchedule = useDeleteSchedule();
  const cancelSchedule = useCancelSchedule();

  const schedules = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Modal>
      <div className="min-h-screen p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MdSchedule className="w-6 h-6 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
              <p className="text-sm text-gray-500">
                Manage farm activity schedules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <Button
              type="small"
              to="/schedules/new"
              className="flex items-center gap-1"
            >
              <MdAdd className="w-4 h-4" />
              Add Schedule
            </Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="mb-4">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdViewList className="w-4 h-4" />
              List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdCalendarViewMonth className="w-4 h-4" />
              Calendar View
            </button>
          </div>
        </div>

        {/* Filters (only show in list view) */}
        {viewMode === "list" && (
          <div className="flex gap-2 items-center mb-4">
            <div className="w-44">
              <SearchableSelect
                label=""
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                placeholder="Filter by status"
              />
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <>
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                Failed to load schedules. Please try again later.
              </div>
            )}

            {!isLoading && schedules.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <MdSchedule className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No schedules yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first schedule.
                </p>
              </div>
            )}

            {schedules.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Farm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {schedule.reference_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {schedule.activity.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {schedule.farm.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {schedule.farm.zone.name}
                            </div>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(
                                schedule.scheduled_date,
                              ).toLocaleDateString()}
                            </div>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                schedule.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {schedule.status.charAt(0).toUpperCase() +
                                schedule.status.slice(1)}
                            </span>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <ActionMenu menuId={`schedule-${schedule.id}`}>
                              <ActionMenu.Trigger />
                              <ActionMenu.Content>
                                <ActionMenu.Item
                                  onClick={() =>
                                    router.push(`/schedules/${schedule.id}`)
                                  }
                                >
                                  <FiEye className="h-4 w-4" />
                                  View
                                </ActionMenu.Item>
                                <ActionMenu.Item
                                  onClick={() =>
                                    router.push(`/schedules/${schedule.id}/edit`)
                                  }
                                >
                                  <FiEdit className="h-4 w-4" />
                                  Edit
                                </ActionMenu.Item>
                                {schedule.status !== "cancelled" && (
                                  <ActionMenu.Item
                                    onClick={() =>
                                      cancelSchedule.mutate(schedule.id)
                                    }
                                    className="text-orange-600"
                                  >
                                    <MdCancel className="h-4 w-4" />
                                    Cancel
                                  </ActionMenu.Item>
                                )}
                                <Modal.Open opens="delete-schedule">
                                  <ActionMenu.Item
                                    onClick={() => setSelectedSchedule(schedule)}
                                    className="text-red-600"
                                  >
                                    <FiTrash className="h-4 w-4" />
                                    Delete
                                  </ActionMenu.Item>
                                </Modal.Open>
                              </ActionMenu.Content>
                            </ActionMenu>
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
          </>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <CalendarView schedules={schedules} />
        )}

        <Modal.Window name="delete-schedule">
          {selectedSchedule ? (
            <DeleteConfirmationModal
              itemName={selectedSchedule.reference_code}
              itemType="Schedule"
              onConfirm={() => deleteSchedule.mutateAsync(selectedSchedule.id)}
              isDeleting={deleteSchedule.isPending}
            />
          ) : (
            <div />
          )}
        </Modal.Window>
      </div>
    </Modal>
  );
}