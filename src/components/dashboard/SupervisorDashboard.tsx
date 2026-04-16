"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSupervisorDashboard } from "@/hooks/useRoleDashboard";
import StatCard from "@/components/common/StatCard";
import RankingChart from "@/components/common/RankingChart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export default function SupervisorDashboard() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState(formatDate(thirtyDaysAgo));
  const [toDate, setToDate] = useState(formatDate(today));
  const [farmId, setFarmId] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      farm_id: farmId || undefined,
    }),
    [fromDate, toDate, farmId],
  );

  const { data, isLoading: loading, isError } = useSupervisorDashboard(params);

  const summary = data?.summary;
  const assignedFarms = data?.assigned_farms ?? [];
  const upcomingSchedules = data?.upcoming_schedules ?? [];
  const tasks = data?.tasks;
  const charts = data?.charts;

  const workerRankingData = useMemo(
    () =>
      (charts?.worker_performance ?? []).map((wp) => ({
        name: wp.worker.name,
        value: wp.total_kgs,
        jobs: wp.jobs,
      })),
    [charts],
  );

  const SkeletonBox = ({ h = 16 }: { h?: number }) => (
    <div
      className="bg-gray-200 animate-pulse rounded"
      style={{ height: `${h}px` }}
    />
  );

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 text-sm">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Collapsible Filters — top */}
      <div className="bg-white rounded-lg shadow p-3">
        <button
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full text-left"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <FiFilter className="text-gray-400" />
          Filters
          <span className="ml-auto">
            {showFilters ? (
              <FiChevronUp className="text-gray-400" />
            ) : (
              <FiChevronDown className="text-gray-400" />
            )}
          </span>
        </button>
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Farm</label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Farms</option>
                {assignedFarms.map((af) => (
                  <option key={af.farm.id} value={af.farm.id}>
                    {af.farm.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow h-20 p-3">
              <SkeletonBox h={12} />
              <div className="mt-2">
                <SkeletonBox h={24} />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Net Production"
              mainValue={`${(summary?.net_kgs ?? 0).toLocaleString()} Kgs`}
              subtitle="Total harvest weight"
            />
            <StatCard
              title="My Farms"
              mainValue={summary?.total_my_farms ?? 0}
              subtitle="Assigned farms"
            />
            <StatCard
              title="Work Groups"
              mainValue={summary?.total_my_workgroups ?? 0}
              subtitle="Active groups"
            />
            <StatCard
              title="Total Workers"
              mainValue={summary?.total_workers ?? 0}
              subtitle="Workforce"
            />
            <StatCard
              title="Total Bookings"
              mainValue={summary?.total_bookings ?? 0}
              subtitle={`${summary?.completed_bookings ?? 0} done · ${summary?.pending_bookings ?? 0} pending`}
            />
          </>
        )}
      </div>

      {/* Top Row: Upcoming Schedules + Pending Quantity Capture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Upcoming Schedules
          </h3>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} h={28} />
              ))}
            </div>
          ) : upcomingSchedules.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No upcoming schedules
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2 pr-3 font-semibold">Ref</th>
                    <th className="text-left py-2 pr-3 font-semibold">Farm</th>
                    <th className="text-left py-2 pr-3 font-semibold">
                      Activity
                    </th>
                    <th className="text-left py-2 font-semibold">Date</th>
                    <th className="text-left py-2 pl-3 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedules.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/schedules/${s.id}`)}
                    >
                      <td className="py-2 pr-3 font-mono text-primary font-semibold">
                        {s.reference_code}
                      </td>
                      <td className="py-2 pr-3 text-gray-700 max-w-30 truncate">
                        {s.farm}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">{s.activity}</td>
                      <td className="py-2 text-gray-500 whitespace-nowrap">
                        {new Date(s.scheduled_date).toLocaleDateString(
                          "en-KE",
                          { day: "2-digit", month: "short" },
                        )}
                      </td>
                      <td className="py-2 pl-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                            s.status === "scheduled"
                              ? "bg-blue-100 text-primary"
                              : s.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Quantity Capture */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            Pending Quantity Capture
            {!!tasks?.pending_quantity_capture.length && (
              <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                {tasks.pending_quantity_capture.length}
              </span>
            )}
          </h3>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} h={28} />
              ))}
            </div>
          ) : !tasks?.pending_quantity_capture.length ? (
            <p className="text-sm text-gray-400 text-center py-8">
              All quantities captured
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2 pr-3 font-semibold">
                      Worker
                    </th>
                    <th className="text-left py-2 pr-3 font-semibold">Farm</th>
                    <th className="text-left py-2 pr-3 font-semibold">
                      Activity
                    </th>
                    <th className="text-left py-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.pending_quantity_capture.map((item) => (
                    <tr
                      key={item.booking_id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2 pr-3 text-gray-800 font-medium">
                        {item.worker.name}
                      </td>
                      <td className="py-2 pr-3 text-gray-600 max-w-30 truncate">
                        {item.farm}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {item.activity}
                      </td>
                      <td className="py-2 text-gray-500 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString("en-KE", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Production Trend + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Production Trend */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Daily Production Trend
          </h3>
          {loading ? (
            <div className="h-64 bg-gray-100 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={charts?.daily_production ?? []}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-KE", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value ?? 0).toLocaleString()} Kgs`,
                    "Production",
                  ]}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("en-KE", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total_kgs"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#16a34a" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Performers */}
        <RankingChart
          title="Top Performers (Kgs)"
          data={workerRankingData}
          loading={loading}
          color="#16a34a"
          borderColor="border-green-400"
          textColor="text-green-600"
          noDataMessage="No worker performance data available"
          metricLabel="Total Kgs"
          dataKey="name"
          renderTooltip={(data) => (
            <>
              <div className="font-bold text-green-600 mb-2">{data.name}</div>
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Total Kgs:</span>
                <span className="font-bold text-gray-900">
                  {data.value.toLocaleString()}
                </span>
              </div>
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Jobs:</span>
                <span className="font-bold text-gray-900">{data.jobs}</span>
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}
