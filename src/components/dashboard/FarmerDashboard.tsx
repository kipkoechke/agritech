// components/dashboard/FarmerDashboard.tsx
"use client";

import { useState, useMemo } from "react";
import { useFarmerDashboard } from "@/hooks/useRoleDashboard";
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

const HA_TO_ACRES = 2.47105;
const formatDate = (date: Date) => date.toISOString().split("T")[0];

export default function FarmerDashboard() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState(formatDate(thirtyDaysAgo));
  const [toDate, setToDate] = useState(formatDate(today));
  const [farmId, setFarmId] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      farm_id: farmId || undefined,
    }),
    [fromDate, toDate, farmId]
  );

  const { data, isLoading: loading, isError } = useFarmerDashboard(params);

  const summary = data?.summary;
  const farms = data?.farms ?? [];
  const charts = data?.charts;

  const workerRankingData = useMemo(
    () =>
      (charts?.worker_payments ?? []).map((wp) => ({
        name: wp.worker.name,
        value: wp.total_kgs,
        jobs: wp.jobs,
      })),
    [charts]
  );

  const farmRankingData = useMemo(
    () =>
      (charts?.farm_performance ?? []).map((fp) => ({
        name: fp.farm.name,
        value: fp.total_kgs,
        size: (fp.size * HA_TO_ACRES).toFixed(1),
        zone: fp.farm.zone,
      })),
    [charts]
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
      {/* Collapsible Filters â€” top, collapsed by default */}
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
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Start Date
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
                End Date
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
              title="Total Production"
              mainValue={`${(summary?.total_kgs ?? 0).toLocaleString()} Kgs`}
              subtitle="Harvest weight"
            />
            <StatCard
              title="Farms"
              mainValue={summary?.total_farms ?? 0}
              subtitle="My farms"
            />
            <StatCard
              title="Workers"
              mainValue={summary?.total_workers ?? 0}
              subtitle="Workforce"
            />
            <StatCard
              title="Work Groups"
              mainValue={summary?.total_work_groups ?? 0}
              subtitle="Active groups"
            />
            <StatCard
              title="Total Bookings"
              mainValue={summary?.total_bookings ?? 0}
              subtitle={`${summary?.completed_bookings ?? 0} done Â· ${summary?.pending_bookings ?? 0} pending`}
            />
          </>
        )}
      </div>

      {/* Middle Row: Worker Ranking + Farm Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingChart
          title="Top Workers (Kgs)"
          data={workerRankingData}
          loading={loading}
          color="#16a34a"
          borderColor="border-green-400"
          textColor="text-green-600"
          noDataMessage="No worker performance data available"
          metricLabel="Total Kgs"
          dataKey="name"
          renderTooltip={(item) => (
            <>
              <div className="font-bold text-green-600 mb-2">{item.name}</div>
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Total Kgs:</span>
                <span className="font-bold text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Jobs:</span>
                <span className="font-bold text-gray-900">{item.jobs}</span>
              </div>
            </>
          )}
        />
        <RankingChart
          title="Farm Performance (Kgs)"
          data={farmRankingData}
          loading={loading}
          color="#0891b2"
          borderColor="border-cyan-400"
          textColor="text-cyan-600"
          noDataMessage="No farm performance data available"
          metricLabel="Total Kgs"
          dataKey="name"
          renderTooltip={(item) => (
            <>
              <div className="font-bold text-cyan-600 mb-2">{item.name}</div>
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Total Kgs:</span>
                <span className="font-bold text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Size:</span>
                <span className="font-bold text-gray-900">
                  {item.size} Acres
                </span>
              </div>
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Zone:</span>
                <span className="font-bold text-gray-900">{item.zone}</span>
              </div>
            </>
          )}
        />
      </div>

      {/* Bottom Row: Daily Production Trend */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Daily Production Trend
        </h3>
        {loading ? (
          <div className="h-64 bg-gray-100 animate-pulse rounded" />
        ) : !charts?.daily_production?.length ? (
          <p className="text-sm text-gray-400 text-center py-12">
            No production data available for this period
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={charts.daily_production}
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
    </div>
  );
}
