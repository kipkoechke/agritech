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
  MdAgriculture,
  MdLocationOn,
  MdPerson,
  MdCheckCircle,
  MdCancel as MdCancelIcon,
  MdPeople,
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

// Activity color mapping
const getActivityColor = (activityName: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
    Plucking: {
      bg: "bg-emerald-500",
      text: "text-emerald-700",
      border: "border-emerald-200",
      light: "bg-emerald-50",
    },
    Pruning: {
      bg: "bg-blue-500",
      text: "text-blue-700",
      border: "border-blue-200",
      light: "bg-blue-50",
    },
    Spraying: {
      bg: "bg-purple-500",
      text: "text-purple-700",
      border: "border-purple-200",
      light: "bg-purple-50",
    },
    Fertilizing: {
      bg: "bg-amber-500",
      text: "text-amber-700",
      border: "border-amber-200",
      light: "bg-amber-50",
    },
    Harvesting: {
      bg: "bg-rose-500",
      text: "text-rose-700",
      border: "border-rose-200",
      light: "bg-rose-50",
    },
    Weeding: {
      bg: "bg-teal-500",
      text: "text-teal-700",
      border: "border-teal-200",
      light: "bg-teal-50",
    },
  };
  return colors[activityName] || {
    bg: "bg-gray-500",
    text: "text-gray-700",
    border: "border-gray-200",
    light: "bg-gray-50",
  };
};

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

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];
  const totalSchedules = schedules.length;
  const completedSchedules = schedules.filter(s => s.status !== "cancelled").length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Calendar Header with Stats */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Activity Calendar</h2>
            <p className="text-sm text-gray-500 mt-0.5">View and manage farm schedules</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalSchedules}</p>
              <p className="text-xs text-gray-500">Total Schedules</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedSchedules}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{totalSchedules - completedSchedules}</p>
              <p className="text-xs text-gray-500">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Calendar Grid - Larger cells */}
        <div className="lg:col-span-2 p-6 border-r border-gray-200">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <MdToday className="w-4 h-4" />
              Today
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-3 mb-3">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center py-2 text-xs font-semibold rounded-lg ${
                  index === 0 || index === 6
                    ? "text-rose-500 bg-rose-50"
                    : "text-gray-500 bg-gray-50"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days - Larger cells */}
          <div className="grid grid-cols-7 gap-3">
            {days.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[160px] bg-gray-50 rounded-xl border border-gray-100"
                  />
                );
              }

              const daySchedules = getSchedulesForDate(day);
              const isToday = new Date().toDateString() === day.toDateString();
              const isSelected = selectedDate?.toDateString() === day.toDateString();
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[160px] p-3 rounded-xl border-2 transition-all text-left
                    ${isSelected
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : isToday
                      ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent"
                      : isWeekend
                      ? "border-rose-100 bg-rose-50/30 hover:bg-rose-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`
                        text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday
                          ? "bg-primary text-white"
                          : isWeekend
                          ? "text-rose-600"
                          : "text-gray-700"
                        }
                      `}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex gap-1">
                      {daySchedules.length > 0 && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          {daySchedules.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {daySchedules.slice(0, 3).map((schedule) => {
                      const colors = getActivityColor(schedule.activity.name);
                      return (
                        <div
                          key={schedule.id}
                          className={`text-xs truncate px-1.5 py-1 rounded-lg ${colors.light} ${colors.text} border ${colors.border}`}
                          title={`${schedule.reference_code} - ${schedule.activity.name}`}
                        >
                          <span className="font-medium">{schedule.activity.name.substring(0, 10)}</span>
                          {schedule.status === "cancelled" && (
                            <MdCancelIcon className="w-3 h-3 inline ml-1 text-red-500" />
                          )}
                        </div>
                      );
                    })}
                    {daySchedules.length > 3 && (
                      <div className="text-xs text-gray-400 text-center pt-1">
                        +{daySchedules.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel - Smaller, with scrollable list */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white flex flex-col h-full">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MdEvent className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">
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
          </div>

          {selectedDate && selectedDateSchedules.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MdSchedule className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No schedules for this date</p>
              <p className="text-xs text-gray-400 mt-1">Click the + button to create one</p>
            </div>
          )}

          {selectedDate && selectedDateSchedules.length > 0 && (
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-1 custom-scrollbar">
              {selectedDateSchedules.map((schedule) => {
                const colors = getActivityColor(schedule.activity.name);
                return (
                  <div
                    key={schedule.id}
                    className={`p-3 rounded-lg border ${colors.border} ${colors.light} hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => window.location.href = `/schedules/${schedule.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                          <p className="font-semibold text-gray-900 text-xs">
                            {schedule.reference_code}
                          </p>
                        </div>
                        <p className={`text-xs font-medium ${colors.text}`}>
                          {schedule.activity.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                            schedule.status
                          )}`}
                        >
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                        {schedule.bookings_count !== undefined && schedule.bookings_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-primary/10 text-primary">
                            <MdPeople className="w-2.5 h-2.5" />
                            {schedule.bookings_count} bookings
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MdAgriculture className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 text-xs truncate">{schedule.farm.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <MdLocationOn className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 text-xs truncate">{schedule.farm.zone.name}</span>
                      </div>
                      {schedule.created_by && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <MdPerson className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600 text-xs truncate">{schedule.created_by.name}</span>
                        </div>
                      )}
                    </div>

                    {schedule.notes && (
                      <p className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-200 line-clamp-2">
                        {schedule.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Activity Legend - Compact */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Activities
            </p>
            <div className="flex flex-wrap gap-2">
              {["Plucking", "Pruning", "Spraying", "Fertilizing", "Harvesting", "Weeding"].map((activity) => {
                const colors = getActivityColor(activity);
                return (
                  <div key={activity} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                    <span className={`text-xs ${colors.text}`}>{activity.substring(0, 6)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
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
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <MdSchedule className="w-5 h-5 text-white" />
              </div>
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
                  className="w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <Button
                type="small"
                to="/schedules/new"
                className="flex items-center gap-1 bg-primary hover:bg-primary/90"
              >
                <MdAdd className="w-4 h-4" />
                Add Schedule
              </Button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="mb-6">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdViewList className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === "calendar"
                    ? "bg-white text-primary shadow-sm"
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
              <div className="w-48">
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                  Failed to load schedules. Please try again later.
                </div>
              )}

              {!isLoading && schedules.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdSchedule className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No schedules yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first schedule.
                  </p>
                  <Button to="/schedules/new" className="mx-auto">
                    <MdAdd className="w-4 h-4" />
                    Create Schedule
                  </Button>
                </div>
              )}

              {schedules.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Reference
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Farm
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {schedules.map((schedule) => {
                          const colors = getActivityColor(schedule.activity.name);
                          return (
                            <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {schedule.reference_code}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors.light} ${colors.text}`}>
                                  {schedule.activity.name}
                                </span>
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
                              <td className="px-6 py-4 whitespace-nowrap">
                                {schedule.bookings_count !== undefined && schedule.bookings_count > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                    <MdPeople className="w-3 h-3" />
                                    {schedule.bookings_count}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {pagination && pagination.total_pages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                      <p className="text-sm text-gray-500">
                        Page {pagination.current_page} of {pagination.total_pages} (
                        {pagination.total_items} items)
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={pagination.current_page <= 1}
                          className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage((p) => p + 1)}
                          disabled={!pagination.next_page}
                          className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
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
      </div>
    </Modal>
  );
}