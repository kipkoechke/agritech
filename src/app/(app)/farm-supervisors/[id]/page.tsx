"use client";

import { use } from "react";
import Link from "next/link";
import {
  MdArrowBack,
  MdSupervisorAccount,
  MdEmail,
  MdPhone,
  MdAccountBalance,
  MdBadge,
  MdGroup,
  MdCalendarToday,
  MdInfo,
} from "react-icons/md";
import { useHrisUser } from "@/hooks/useHrisUser";

const InfoCard = ({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon?: any;
  accent?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <div className="flex items-center gap-1.5">
      {Icon && (
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${accent ? "text-primary" : "text-gray-400"}`}
        />
      )}
      <span
        className={`text-sm font-medium ${accent ? "text-primary" : "text-gray-800"}`}
      >
        {value || "—"}
      </span>
    </div>
  </div>
);

export default function SupervisorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useHrisUser(id);
  const supervisor = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading supervisor details…</p>
        </div>
      </div>
    );
  }

  if (error || !supervisor) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Supervisor not found
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This supervisor doesn&apos;t exist or an error occurred.
          </p>
          <Link
            href="/farm-supervisors"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Farm Supervisors
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(supervisor.created_at).toLocaleDateString(
    "en-KE",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const updatedDate = new Date(supervisor.updated_at).toLocaleDateString(
    "en-KE",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 min-w-0">
          <Link
            href="/farm-supervisors"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
          >
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              {supervisor.name}
            </h1>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5 capitalize">
              {supervisor.role_description || supervisor.role}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdSupervisorAccount className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Contact Information
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard
              label="Full Name"
              value={supervisor.name}
              icon={MdSupervisorAccount}
            />
            <InfoCard label="Email" value={supervisor.email} icon={MdEmail} />
            <InfoCard
              label="Phone"
              value={supervisor.phone || "—"}
              icon={MdPhone}
            />
          </div>
        </div>

        {/* Role & Membership Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdBadge className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Role & Membership
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard
              label="Role"
              value={supervisor.role_description || supervisor.role}
              icon={MdBadge}
            />
            <InfoCard
              label="Membership"
              value={supervisor.membership || "—"}
              icon={MdGroup}
            />
            <InfoCard
              label="Account Number"
              value={supervisor.account_number || "—"}
              icon={MdAccountBalance}
            />
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdCalendarToday className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Timeline
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 gap-6">
            <InfoCard
              label="Created"
              value={createdDate}
              icon={MdCalendarToday}
            />
            <InfoCard
              label="Last Updated"
              value={updatedDate}
              icon={MdCalendarToday}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
