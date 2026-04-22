"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdPerson,
  MdEdit,
  MdInfo,
  MdEmail,
  MdPhone,
  MdBadge,
  MdCreditCard,
  MdGroups,
  MdCalendarToday,
  MdUpdate,
  MdDescription,
  MdScale,
  MdPayments,
} from "react-icons/md";
import { useHrisUser } from "@/hooks/useHrisUser";
import { useWorkerPaymentSummary } from "@/hooks/useWorkerPaymentSummary";

const PLUCKER_RATE = 9;
const SUPERVISOR_RATE = 2;

function getDefaultDateRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const toDate = now.toISOString().split("T")[0];
  const fromDate = firstDay.toISOString().split("T")[0];
  return { fromDate, toDate };
}

interface InfoCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
}

function InfoCard({ label, value, icon: Icon }: InfoCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-800">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

const formatRole = (role: string) =>
  role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  supervisor: "bg-blue-100 text-blue-700",
  farmer: "bg-green-100 text-green-700",
  farm_worker: "bg-amber-100 text-amber-700",
};

export default function HrisUserDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: userResponse, isLoading } = useHrisUser(id);

  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);

  const user = userResponse?.data;

  const { data: pluckingData, isLoading: pluckingLoading } =
    useWorkerPaymentSummary(
      user?.role === "farmer"
        ? { from_date: fromDate, to_date: toDate, owner_id: id }
        : {},
    );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading user…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            User not found
          </h2>
          <Link
            href="/hris/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(user.created_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(user.updated_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/hris/users"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {user.name}
              </h1>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">
                {formatRole(user.role)}
              </p>
            </div>
          </div>
          <Link
            href={`/hris/users/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdPerson className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Contact Information
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard label="Full Name" value={user.name} icon={MdPerson} />
            <InfoCard label="Email" value={user.email} icon={MdEmail} />
            <InfoCard label="Phone" value={user.phone} icon={MdPhone} />
          </div>
        </div>

        {/* Role & Access Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdBadge className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Role & Access
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {/* Role badge */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Role
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                  roleColors[user.role] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                <MdBadge className="w-3.5 h-3.5" />
                {formatRole(user.role)}
              </span>
            </div>
            {user.role_description && (
              <InfoCard
                label="Role Description"
                value={user.role_description}
                icon={MdDescription}
              />
            )}
            <InfoCard
              label="Account Number"
              value={user.account_number ?? "—"}
              icon={MdCreditCard}
            />
            <InfoCard
              label="Membership"
              value={user.membership ?? "—"}
              icon={MdGroups}
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
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard
              label="Created"
              value={createdDate}
              icon={MdCalendarToday}
            />
            <InfoCard
              label="Last Updated"
              value={updatedDate}
              icon={MdUpdate}
            />
          </div>
        </div>

        {/* Farmer Plucking Workers Section */}
        {user.role === "farmer" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <MdScale className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Plucking Workers — Payment Summary
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {pluckingLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="w-7 h-7 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {!pluckingLoading && (pluckingData?.data ?? []).length === 0 && (
              <div className="px-6 py-8 text-center">
                <MdPayments className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No plucking records found for the selected period.
                </p>
              </div>
            )}

            {!pluckingLoading && (pluckingData?.data ?? []).length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Worker</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Kgs</th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rate (KSh/kg)</th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount (KSh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(pluckingData?.data ?? []).map((item) => {
                      const isSupervisor = item.worker.role === "supervisor";
                      const rate = isSupervisor ? SUPERVISOR_RATE : PLUCKER_RATE;
                      const amount = (item.total_kgs || 0) * rate;
                      return (
                        <tr key={item.worker.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3.5">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.worker.name}</p>
                              <p className="text-xs text-gray-400">{item.worker.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isSupervisor ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                              {isSupervisor ? "Supervisor" : "Plucker"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-500">
                            {fromDate} – {toDate}
                          </td>
                          <td className="px-6 py-3.5 text-right text-sm text-gray-900">
                            {(item.total_kgs || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-3.5 text-right text-sm text-gray-500">
                            {rate}
                          </td>
                          <td className="px-6 py-3.5 text-right text-sm font-semibold text-emerald-700">
                            {amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50/60">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Totals</td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        {(pluckingData?.data ?? [])
                          .reduce((s, i) => s + (i.total_kgs || 0), 0)
                          .toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td />
                      <td className="px-6 py-3 text-right text-sm font-semibold text-emerald-700">
                        {(pluckingData?.data ?? [])
                          .reduce((s, i) => {
                            const r = i.worker.role === "supervisor" ? SUPERVISOR_RATE : PLUCKER_RATE;
                            return s + (i.total_kgs || 0) * r;
                          }, 0)
                          .toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
