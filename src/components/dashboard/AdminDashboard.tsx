"use client";

import { useState } from "react";
import {
  MdDashboard,
  MdAgriculture,
  MdPeople,
  MdFactory,
  MdMap,
  MdBookOnline,
  MdTrendingUp,
  MdScale,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAdminDashboard } from "@/hooks/useRoleDashboard";

function getDefaultDateRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    fromDate: firstDay.toISOString().split("T")[0],
    toDate: now.toISOString().split("T")[0],
  };
}

const COLORS = [
  "#059669",
  "#0891b2",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#2563eb",
  "#65a30d",
];

export default function AdminDashboard() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [zoneId, setZoneId] = useState("");
  const [factoryId, setFactoryId] = useState("");

  const { data, isLoading, error } = useAdminDashboard({
    from_date: fromDate,
    to_date: toDate,
    zone_id: zoneId || undefined,
    factory_id: factoryId || undefined,
  });

  const summary = data?.summary;
  const charts = data?.charts;
  const filters = data?.filters;

  const bookingStatusData = charts?.booking_status
    ? [
        { name: "Confirmed", value: charts.booking_status.confirmed },
        { name: "Pending", value: charts.booking_status.pending },
        { name: "Completed", value: charts.booking_status.completed },
        {
          name: "Factory Received",
          value: charts.booking_status.factory_received,
        },
      ]
    : [];

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
          {filters?.available_zones && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Zone
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900"
              >
                <option value="">All Zones</option>
                {filters.available_zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {filters?.available_factories && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Factory
              </label>
              <select
                value={factoryId}
                onChange={(e) => setFactoryId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900"
              >
                <option value="">All Factories</option>
                {filters.available_factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
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
            label="Farms"
            value={summary.total_farms}
          />
          <StatCard
            icon={MdPeople}
            label="Workers"
            value={summary.total_workers}
          />
          <StatCard
            icon={MdPeople}
            label="Farmers"
            value={summary.total_farmers}
          />
          <StatCard
            icon={MdPeople}
            label="Supervisors"
            value={summary.total_supervisors}
          />
          <StatCard
            icon={MdFactory}
            label="Factories"
            value={summary.total_factories}
          />
          <StatCard icon={MdMap} label="Zones" value={summary.total_zones} />
          <StatCard
            icon={MdBookOnline}
            label="Total Bookings"
            value={summary.total_bookings}
          />
          <StatCard
            icon={MdBookOnline}
            label="Completed"
            value={summary.completed_bookings}
            color="text-green-600"
          />
          <StatCard
            icon={MdBookOnline}
            label="Pending"
            value={summary.pending_bookings}
            color="text-yellow-600"
          />
          <StatCard
            icon={MdScale}
            label="Total Kgs"
            value={summary.total_kgs.toLocaleString()}
            color="text-emerald-600"
          />
          <StatCard
            icon={MdFactory}
            label="Factory Qty"
            value={summary.factory_qty}
          />
          <StatCard
            icon={MdTrendingUp}
            label="Activities"
            value={summary.total_activities}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Bookings Chart */}
        {charts?.daily_bookings && charts.daily_bookings.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Daily Bookings
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={charts.daily_bookings}>
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
                  dataKey="count"
                  stroke="#059669"
                  name="Bookings"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="total_kgs"
                  stroke="#0891b2"
                  name="Kgs"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Booking Status Pie */}
        {bookingStatusData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Booking Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {bookingStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Zone Distribution */}
        {charts?.zone_distribution && charts.zone_distribution.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Zone Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.zone_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="farms" fill="#059669" name="Farms" />
                <Bar dataKey="total_size" fill="#0891b2" name="Total Size" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Factory Performance */}
        {charts?.factory_performance &&
          charts.factory_performance.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Factory Performance
              </h3>
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Factory
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Zone
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                        Farms
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                        Clusters
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {charts.factory_performance.map((f) => (
                      <tr key={f.id}>
                        <td className="px-3 py-1.5 text-gray-900">
                          {f.name}{" "}
                          <span className="text-gray-400 text-xs">
                            ({f.code})
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-gray-500">{f.zone}</td>
                        <td className="px-3 py-1.5 text-right text-gray-900">
                          {f.farms}
                        </td>
                        <td className="px-3 py-1.5 text-right text-gray-900">
                          {f.clusters}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      {/* Top Workers */}
      {charts?.top_workers && charts.top_workers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Top Workers
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Worker
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Phone
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Kgs
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Jobs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {charts.top_workers.map((w, i) => (
                  <tr key={w.worker.id + i}>
                    <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {w.worker.name}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {w.worker.phone}
                    </td>
                    <td className="px-4 py-2 text-right text-emerald-600 font-medium">
                      {w.total_kgs.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {w.jobs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Farms */}
      {charts?.top_farms && charts.top_farms.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Top Farms
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Farm
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Kgs
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Jobs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {charts.top_farms.map((f, i) => (
                  <tr key={f.farm.id + i}>
                    <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {f.farm.name}
                    </td>
                    <td className="px-4 py-2 text-right text-emerald-600 font-medium">
                      {f.total_kgs.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {f.jobs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
