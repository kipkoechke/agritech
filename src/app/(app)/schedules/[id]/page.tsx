"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import {
    MdArrowBack,
    MdSchedule,
    MdCancel,
    MdPerson,
    MdAgriculture,
    MdLocationOn,
    MdCalendarToday,
    MdCheckCircle,
    MdPhone,
    MdPeople,
    MdEvent,
    MdInfo,
    MdStore,
    MdAssignmentInd,
} from "react-icons/md";
import Button from "@/components/common/Button";
import { useSchedule, useCancelSchedule } from "@/hooks/useSchedule";

// Detail Row Component
const DetailRow = ({
                       label,
                       value,
                       icon: Icon,
                   }: {
    label: string;
    value: string | number;
    icon?: any;
}) => (
    <div className="flex items-start py-2">
        <div className="w-28 flex-shrink-0">
            <div className="flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
          {label}
        </span>
            </div>
        </div>
        <div className="flex-1">
      <span className="text-xs text-gray-800 font-medium">
        {value || "—"}
      </span>
        </div>
    </div>
);

// Booking Card Component
const BookingCard = ({ booking }: { booking: any }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <MdPerson className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-900">
                            {booking.worker?.name || "Unknown Worker"}
                        </p>
                        {booking.worker?.phone && (
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                <MdPhone className="w-2.5 h-2.5" />
                                {booking.worker.phone}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    {booking.is_confirmed && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-green-100 text-green-700">
              <MdCheckCircle className="w-2.5 h-2.5" />
              Confirmed
            </span>
                    )}
                    {booking.worker_signed && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-blue-100 text-blue-700">
              Signed
            </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200">
                <div>
                    <p className="text-[9px] text-gray-500">Farm Qty</p>
                    <p className="text-xs font-semibold text-gray-900">
                        {booking.farm_qty ? `${booking.farm_qty} kg` : "—"}
                    </p>
                </div>
                <div>
                    <p className="text-[9px] text-gray-500">Factory Qty</p>
                    <p className="text-xs font-semibold text-gray-900">
                        {booking.factory_qty ? `${booking.factory_qty} kg` : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Navigation Item Component
const NavItem = ({
                     id,
                     label,
                     icon: Icon,
                     isActive,
                     onClick,
                     badgeCount,
                 }: {
    id: string;
    label: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
    badgeCount?: number;
}) => (
    <button
        onClick={onClick}
        className={`
      w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
      ${
            isActive
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-gray-700 hover:bg-gray-100"
        }
    `}
    >
        <div className={`${isActive ? "text-white" : "text-gray-500"} flex-shrink-0`}>
            <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 text-left text-xs font-medium">{label}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
            <span
                className={`
          px-1.5 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0
          ${
                    isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                }
        `}
            >
        {badgeCount}
      </span>
        )}
    </button>
);

export default function ScheduleDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: scheduleResponse, isLoading } = useSchedule(id);
    const cancelSchedule = useCancelSchedule();
    const [activeSection, setActiveSection] = useState("overview");

    const schedule = scheduleResponse?.data;
    const bookings = schedule?.bookings?.data || [];
    const bookingsCount = schedule?.bookings_count || 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                    Schedule not found
                </div>
            </div>
        );
    }

    const scheduledDate = new Date(schedule.scheduled_date);
    const createdDate = new Date(schedule.created_at);
    const updatedDate = new Date(schedule.updated_at);
    const isUpdated = schedule.created_at !== schedule.updated_at;

    const confirmedCount = bookings.filter((b: any) => b.is_confirmed).length;
    const signedCount = bookings.filter((b: any) => b.worker_signed).length;
    const withQuantitiesCount = bookings.filter(
        (b: any) => b.farm_qty !== null
    ).length;

    const sections = [
        { id: "overview", label: "Overview", icon: MdInfo },
        { id: "schedule", label: "Schedule", icon: MdSchedule },
        { id: "farm", label: "Farm", icon: MdAgriculture },
        { id: "creator", label: "Creator", icon: MdPerson },
        {
            id: "bookings",
            label: "Bookings",
            icon: MdPeople,
            badge: bookingsCount,
        },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "overview":
                return (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                                <p className="text-2xl font-bold text-blue-700">
                                    {bookings.length}
                                </p>
                                <p className="text-[10px] text-blue-600 font-medium mt-1">
                                    Total Bookings
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                                <p className="text-2xl font-bold text-green-700">
                                    {confirmedCount}
                                </p>
                                <p className="text-[10px] text-green-600 font-medium mt-1">
                                    Confirmed
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                                <p className="text-2xl font-bold text-purple-700">
                                    {signedCount}
                                </p>
                                <p className="text-[10px] text-purple-600 font-medium mt-1">
                                    Worker Signed
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                                <p className="text-2xl font-bold text-amber-700">
                                    {withQuantitiesCount}
                                </p>
                                <p className="text-[10px] text-amber-600 font-medium mt-1">
                                    With Quantities
                                </p>
                            </div>
                        </div>

                        {/* Basic Info Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MdSchedule className="w-4 h-4 text-primary" />
                                Schedule Information
                            </h3>
                            <div className="space-y-2">
                                <DetailRow
                                    label="Reference Code"
                                    value={schedule.reference_code}
                                />
                                <DetailRow label="Activity" value={schedule.activity.name} />
                                <DetailRow
                                    label="Scheduled Date"
                                    value={scheduledDate.toLocaleDateString("en-KE", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                />
                                <DetailRow label="Farm" value={schedule.farm.name} />
                                <DetailRow label="Zone" value={schedule.farm.zone.name} />
                                <DetailRow label="Created By" value={schedule.created_by.name} />
                                {schedule.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                            Notes
                                        </p>
                                        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                                            {schedule.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "schedule":
                return (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Schedule Details
                        </h3>
                        <div className="space-y-1">
                            <DetailRow label="Reference Code" value={schedule.reference_code} />
                            <DetailRow
                                label="Activity"
                                value={schedule.activity.name}
                                icon={MdAgriculture}
                            />
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
                            <DetailRow
                                label="Status"
                                value={
                                    schedule.status.charAt(0).toUpperCase() +
                                    schedule.status.slice(1)
                                }
                            />
                            {schedule.notes && (
                                <div className="flex items-start py-2">
                                    <div className="w-28 flex-shrink-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Notes
                    </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                                            {schedule.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "farm":
                return (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Farm Details
                        </h3>
                        <div className="space-y-1">
                            <DetailRow
                                label="Farm Name"
                                value={schedule.farm.name}
                                icon={MdAgriculture}
                            />
                            <DetailRow
                                label="Zone"
                                value={schedule.farm.zone.name}
                                icon={MdLocationOn}
                            />
                            {schedule.farm.location && (
                                <DetailRow
                                    label="Location"
                                    value={schedule.farm.location}
                                    icon={MdLocationOn}
                                />
                            )}
                        </div>
                    </div>
                );

            case "creator":
                return (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Creator Information
                        </h3>
                        <div className="space-y-1">
                            <DetailRow
                                label="Created By"
                                value={schedule.created_by.name}
                                icon={MdPerson}
                            />
                            <DetailRow
                                label="Created At"
                                value={createdDate.toLocaleDateString("en-KE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                                icon={MdCalendarToday}
                            />
                            {isUpdated && (
                                <DetailRow
                                    label="Updated At"
                                    value={updatedDate.toLocaleDateString("en-KE", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                    icon={MdCalendarToday}
                                />
                            )}
                        </div>
                    </div>
                );

            case "bookings":
                return (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Bookings ({bookingsCount})
                            </h3>
                            <div className="flex gap-2">
                <span className="text-xs text-green-600">
                  ✓ {confirmedCount} confirmed
                </span>
                                <span className="text-xs text-blue-600">
                  ✍ {signedCount} signed
                </span>
                            </div>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MdPeople className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">No bookings for this schedule</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {bookings.map((booking: any, index: number) => (
                                    <div key={booking.id}>
                                        <BookingCard booking={booking} />
                                        {index < bookings.length - 1 && (
                                            <div className="border-t border-gray-100 my-2" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/schedules"
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <MdArrowBack className="w-4 h-4 text-gray-600" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <MdSchedule className="w-5 h-5 text-primary" />
                                    <h1 className="text-lg font-bold text-gray-900">
                                        {schedule.reference_code}
                                    </h1>
                                    <span
                                        className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                            schedule.status === "cancelled"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                    {schedule.status.charAt(0).toUpperCase() +
                        schedule.status.slice(1)}
                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {schedule.activity.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {schedule.status !== "cancelled" && (
                                <button
                                    onClick={() => cancelSchedule.mutate(id)}
                                    disabled={cancelSchedule.isPending}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
                                >
                                    <MdCancel className="w-3.5 h-3.5" />
                                    {cancelSchedule.isPending ? "Cancelling..." : "Cancel"}
                                </button>
                            )}
                            <Button type="small" to={`/schedules/${id}/edit`}>
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Side Navigation - Reduced spacing and width */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex gap-3">
                    {/* Side Navigation - Reduced width */}
                    <div className="w-48 flex-shrink-0">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-20 overflow-hidden">
                            <div className="px-3 py-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    Navigation
                                </p>
                            </div>
                            <div className="p-2 space-y-0.5">
                                {sections.map((section) => (
                                    <NavItem
                                        key={section.id}
                                        id={section.id}
                                        label={section.label}
                                        icon={section.icon}
                                        isActive={activeSection === section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        badgeCount={section.badge}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Area - Takes remaining space */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5">{renderContent()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}