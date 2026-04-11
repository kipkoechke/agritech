// components/dashboard/FarmerDashboard.tsx
"use client";

import { useState } from "react";
import {
  MdAgriculture,
  MdPeople,
  MdScale,
  MdTrendingUp,
  MdTrendingDown,
  MdGroups,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { useFarmerDashboard } from "@/hooks/useRoleDashboard";

function getDefaultDateRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    fromDate: firstDay.toISOString().split("T")[0],
    toDate: now.toISOString().split("T")[0],
  };
}

export default function FarmerDashboard() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [farmId, setFarmId] = useState("");

  const { data, isLoading, error } = useFarmerDashboard({
    from_date: fromDate,
    to_date: toDate,
    farm_id: farmId || undefined,
  });

  const summary = data?.summary;
  const farms = data?.farms;
  const workGroups = data?.work_groups;
  const charts = data?.charts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900"
            />
          </div>
          {farms && farms.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Farm
              </label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900"
              >
                <option value="">All Farms</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            icon={MdAgriculture}
            label="Total Farms"
            value={summary.total_farms || 0}
          />
          <StatCard
            icon={MdPeople}
            label="Total Workers"
            value={summary.total_workers || 0}
          />
          <StatCard
            icon={MdScale}
            label="Total Kgs"
            value={summary.total_kgs?.toLocaleString() || 0}
            color="text-emerald-600"
          />
          <StatCard
            icon={MdTrendingUp}
            label="Total Bookings"
            value={summary.total_bookings || 0}
          />
          <StatCard
            icon={MdGroups}
            label="Work Groups"
            value={summary.total_work_groups || 0}
          />
          
          {/* Monthly Comparison Cards with null checks */}
          {summary.monthly_comparison && (
            <>
              <StatCard
                icon={MdTrendingUp}
                label="This Month"
                value={`${summary.monthly_comparison.current_month_kgs?.toLocaleString() || 0} kg`}
                color="text-emerald-600"
              />
              <StatCard
                icon={
                  (summary.monthly_comparison.change_percentage || 0) >= 0
                    ? MdTrendingUp
                    : MdTrendingDown
                }
                label="vs Last Month"
                value={`${(summary.monthly_comparison.change_percentage || 0) >= 0 ? "+" : ""}${(summary.monthly_comparison.change_percentage || 0).toFixed(1)}%`}
                color={
                  (summary.monthly_comparison.change_percentage || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              />
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Production */}
        {charts?.daily_production && charts.daily_production.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Daily Production
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={charts.daily_production}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d) => d?.slice(5) || ""}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_kgs"
                  stroke="#059669"
                  name="Kgs"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke="#0891b2"
                  name="Jobs"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Worker Payments */}
        {charts?.worker_payments && charts.worker_payments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Worker Payments
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.worker_payments.map((w) => ({ 
                name: w.worker?.name || "Unknown", 
                total_kgs: w.total_kgs || 0, 
                total_jobs: w.total_jobs || 0 
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_kgs" fill="#059669" name="Kgs" />
                <Bar dataKey="total_jobs" fill="#0891b2" name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Farms Table */}
      {farms && farms.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">My Farms</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Farm
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Zone
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Factory
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Size
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Supervisor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farms.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {f.name || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{f.zone || "—"}</td>
                    <td className="px-4 py-2 text-gray-500">{f.factory || "—"}</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {f.size || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {f.supervisor?.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Work Groups */}
      {workGroups && workGroups.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Work Groups
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Group
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Code
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Members
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Total Kgs
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workGroups.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {g.name || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{g.code || "—"}</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {g.members_count || 0}
                    </td>
                    <td className="px-4 py-2 text-right text-emerald-600 font-medium">
                      {g.total_kgs?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${g.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {g.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Farm Performance */}
        {charts?.farm_performance && charts.farm_performance.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Farm Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Farm
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Total Kgs
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Bookings
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {charts.farm_performance.map((f, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-1.5 text-gray-900">
                        {f.farm?.name || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-right text-emerald-600 font-medium">
                        {f.total_kgs?.toLocaleString() || 0}
                      </td>
                      <td className="px-3 py-1.5 text-right text-gray-900">
                        {f.total_bookings || 0}
                      </td>
                      <td className="px-3 py-1.5 text-right text-gray-900">
                        {f.completed || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Breakdown */}
        {charts?.activity_breakdown && charts.activity_breakdown.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Activity Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Farm
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Activity
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Jobs
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Kgs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {charts.activity_breakdown.map((a, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5 text-gray-900">
                        {a.farm || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-gray-900">
                        {a.activity || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-right text-gray-900">
                        {a.total_jobs || 0}
                      </td>
                      <td className="px-3 py-1.5 text-right text-emerald-600 font-medium">
                        {a.total_kgs?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className={`text-lg font-semibold ${color || "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}