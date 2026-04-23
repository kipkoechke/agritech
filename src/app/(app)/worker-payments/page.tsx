"use client";

import { useState } from "react";
import { MdPayments, MdSearch } from "react-icons/md";
import PageHeader from "@/components/common/PageHeader";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useWorkerPaymentSummary } from "@/hooks/useWorkerPaymentSummary";
import { useHrisUsers } from "@/hooks/useHrisUser";

const PLUCKER_RATE = 9;   // KSh per kg for pluckers / farm workers
const SUPERVISOR_RATE = 2; // KSh per kg for supervisors

function getDefaultDateRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const toDate = now.toISOString().split("T")[0];
  const fromDate = firstDay.toISOString().split("T")[0];
  return { fromDate, toDate };
}

const formatRole = (role?: string) => {
  if (!role) return "—";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function WorkerPaymentsPage() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [supervisorFilter, setSupervisorFilter] = useState("");

  const [supervisorSearch, setSupervisorSearch] = useState("");

  const { data: supervisorsData } = useHrisUsers({ role: "supervisor", search: supervisorSearch || undefined });

  const { data, isLoading, error } = useWorkerPaymentSummary({
    from_date: fromDate,
    to_date: toDate,
    role: roleFilter || undefined,
    supervisor_id: supervisorFilter || undefined,
  });

  const summaries = data?.data || [];
  const summary = data?.summary;

  const filtered = search
    ? summaries.filter(
        (s) =>
          s.worker?.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.worker?.phone?.includes(search),
      )
    : summaries;

  const totalKgs =
    summary?.total_kgs ??
    filtered.reduce((sum, s) => sum + (s.total_kgs || 0), 0);
  const totalJobs = filtered.reduce((sum, s) => sum + (s.total_jobs || 0), 0);

  const supervisorOptions = [
    { value: "", label: "All Supervisors" },
    ...(supervisorsData?.data?.map((u) => ({ value: u.id, label: u.name })) ?? []),
  ];

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "farm_worker", label: "Plucker / Farm Worker" },
    { value: "supervisor", label: "Supervisor" },
  ];

  return (
    <div className="min-h-screen p-4 space-y-4">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <MdPayments className="w-5 h-5 text-emerald-600" />
            <div>
              <h1 className="text-base md:text-lg font-semibold text-slate-900">
                Worker Payments
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 hidden md:block">
                View payment summary for farm workers and supervisors
              </p>
            </div>
          </div>
        }
        search={
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            />
          </div>
        }
      />

      {/* Filters Row */}
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Role
          </label>
          <SearchableSelect
            label=""
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="All Roles"
          />
        </div>
        <div className="w-52">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Supervisor
          </label>
          <SearchableSelect
            label=""
            options={supervisorOptions}
            value={supervisorFilter}
            onChange={setSupervisorFilter}
            placeholder="All Supervisors"
            onSearchChange={setSupervisorSearch}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Workers</p>
          <p className="text-lg font-semibold text-gray-900">
            {summary?.total_workers ?? filtered.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Kgs</p>
          <p className="text-lg font-semibold text-gray-900">
            {totalKgs.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Jobs</p>
          <p className="text-lg font-semibold text-emerald-600">
            {totalJobs.toLocaleString()}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Failed to load payment summary. Please try again later.
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MdPayments className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No payment data
          </h3>
          <p className="text-gray-500">
            No payment records found for the selected date range.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Kgs
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Jobs
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (KSh/kg)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (KSh)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((item) => {
                  const isSupervisor = item.worker.role === "supervisor";
                  const rate = isSupervisor ? SUPERVISOR_RATE : PLUCKER_RATE;
                  const amount = (item.total_kgs || 0) * rate;
                  return (
                    <tr key={item.worker.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.worker.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.worker.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isSupervisor
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {formatRole(item.worker.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">
                          {item.total_kgs?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">
                          {item.total_jobs}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-500">
                          {rate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-emerald-700">
                          {amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-3 text-right text-sm font-semibold text-gray-700"
                  >
                    Totals
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    {totalKgs.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    {totalJobs.toLocaleString()}
                  </td>
                  <td />
                  <td className="px-6 py-3 text-right text-sm font-semibold text-emerald-700">
                    {filtered
                      .reduce((sum, item) => {
                        const isSupervisor = item.worker.role === "supervisor";
                        const rate = isSupervisor ? SUPERVISOR_RATE : PLUCKER_RATE;
                        return sum + (item.total_kgs || 0) * rate;
                      }, 0)
                      .toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
