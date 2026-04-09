"use client";

import { useState } from "react";
import {
  MdAgriculture,
  MdPeople,
  MdScale,
  MdAssignment,
  MdWarning,
  MdCheckCircle,
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
import { useSupervisorDashboard } from "@/hooks/useRoleDashboard";

function getDefaultDateRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    fromDate: firstDay.toISOString().split("T")[0],
    toDate: now.toISOString().split("T")[0],
  };
}

export default function SupervisorDashboard() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [farmId, setFarmId] = useState("");

  const { data, isLoading, error } = useSupervisorDashboard({
    from_date: fromDate,
    to_date: toDate,
    farm_id: farmId || undefined,
  });

  const summary = data?.summary;
  const assignedFarms = data?.assigned_farms;
  const tasks = data?.tasks;
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
          {assignedFarms && assignedFarms.length > 0 && (
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
                {assignedFarms.map((f) => (
                  <option key={f.farm.id} value={f.farm.id}>
                    {f.farm.name}
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
            label="Assigned Farms"
            value={summary.total_assigned_farms}
          />
          <StatCard
            icon={MdPeople}
            label="Total Workers"
            value={summary.total_workers}
          />
          <StatCard
            icon={MdScale}
            label="Total Kgs"
            value={summary.total_kgs.toLocaleString()}
            color="text-emerald-600"
          />
          <StatCard
            icon={MdAssignment}
            label="Total Bookings"
            value={summary.total_bookings}
          />
          <StatCard
            icon={MdCheckCircle}
            label="Completed"
            value={summary.completed_bookings}
            color="text-green-600"
          />
          <StatCard
            icon={MdWarning}
            label="Pending"
            value={summary.pending_bookings}
            color="text-yellow-600"
          />
        </div>
      )}

      {/* Tasks Section */}
      {tasks && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Unconfirmed Attendance */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MdWarning className="text-yellow-500" />
              Unconfirmed Attendance ({tasks.unconfirmed_attendance.length})
            </h3>
            {tasks.unconfirmed_attendance.length === 0 ? (
              <p className="text-sm text-gray-500">
                No unconfirmed attendance.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Worker
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Farm
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.unconfirmed_attendance.map((t) => (
                      <tr key={t.booking_id}>
                        <td className="px-3 py-1.5 text-gray-900">
                          {t.worker.name}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500">
                          {t.farm}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500">{t.date}</td>
                        <td className="px-3 py-1.5 text-gray-500">
                          {t.activity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Quantity Capture */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MdScale className="text-orange-500" />
              Pending Quantity Capture ({tasks.pending_quantity_capture.length})
            </h3>
            {tasks.pending_quantity_capture.length === 0 ? (
              <p className="text-sm text-gray-500">No pending captures.</p>
            ) : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Worker
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Farm
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.pending_quantity_capture.map((t) => (
                      <tr key={t.booking_id}>
                        <td className="px-3 py-1.5 text-gray-900">
                          {t.worker.name}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500">
                          {t.farm}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500">{t.date}</td>
                        <td className="px-3 py-1.5 text-gray-500">
                          {t.activity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assigned Farms */}
      {assignedFarms && assignedFarms.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Assigned Farms
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Farm
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Owner
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Zone
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Total Kgs
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Bookings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignedFarms.map((f) => (
                  <tr key={f.farm.id}>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {f.farm.name}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{f.owner}</td>
                    <td className="px-4 py-2 text-gray-500">{f.zone}</td>
                    <td className="px-4 py-2 text-right text-emerald-600 font-medium">
                      {f.total_kgs.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {f.total_bookings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  tickFormatter={(d) => d.slice(5)}
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

        {/* Worker Performance */}
        {charts?.worker_performance && charts.worker_performance.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Worker Performance
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.worker_performance.map((w) => ({ name: w.worker.name, total_kgs: w.total_kgs, total_jobs: w.total_jobs }))}>
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
