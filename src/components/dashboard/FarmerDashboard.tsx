// components/dashboard/FarmerDashboard.tsx
"use client";

import { useState, useMemo } from "react";
import { useFarmerDashboard } from "@/hooks/useRoleDashboard";
import type {
  WorkerPaymentChart,
  WorkerJobDetail,
} from "@/types/roleDashboard";
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
import { FiChevronDown, FiChevronUp, FiFilter, FiCalendar } from "react-icons/fi";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { useWorkGroups } from "@/hooks/useWorkGroup";
import { useWorkers } from "@/hooks/useWorkers";
import { useHrisUsers } from "@/hooks/useHrisUser";

const HA_TO_ACRES = 2.47105;
const formatDate = (date: Date) => date.toISOString().split("T")[0];
const WORKER_RATE = 9;
const SUPERVISOR_RATE = 2;

export default function FarmerDashboard() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState(formatDate(thirtyDaysAgo));
  const [toDate, setToDate] = useState(formatDate(today));
  const [farmId, setFarmId] = useState("");
  const [workGroupId, setWorkGroupId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);
  const [showPaymentTab, setShowPaymentTab] = useState(false);

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      farm_id: farmId || undefined,
      work_group_id: workGroupId || undefined,
      worker_id: workerId || undefined,
      supervisor_id: supervisorId || undefined,
    }),
    [fromDate, toDate, farmId, workGroupId, workerId, supervisorId],
  );

  const { data, isLoading: loading, isError } = useFarmerDashboard(params);

  const summary = data?.summary;
  const farms = data?.farms ?? [];
  const workGroups = data?.work_groups ?? [];
  const charts = data?.charts;

  const workGroupRatesMap = useMemo(() => {
    const map: Record<string, { plucker_rate: number; supervisor_rate: number }> = {};
    workGroups.forEach((wg) => {
      if (wg.plucker_rate !== undefined || wg.supervisor_rate !== undefined) {
        map[wg.id] = {
          plucker_rate: wg.plucker_rate ?? 0,
          supervisor_rate: wg.supervisor_rate ?? 0,
        };
      }
    });
    return map;
  }, [workGroups]);

  const getWorkerTotalPay = (wp: WorkerPaymentChart) => {
    const wgId = wp.work_group?.id ?? "";
    const rate = wp.work_group?.plucker_rate ?? workGroupRatesMap[wgId]?.plucker_rate ?? WORKER_RATE;
    return wp.jobs.reduce((sum, job) => sum + (job.kgs * rate), 0);
  };

  const getJobRate = (wp: WorkerPaymentChart) => {
    const wgId = wp.work_group?.id ?? "";
    return wp.work_group?.plucker_rate ?? workGroupRatesMap[wgId]?.plucker_rate ?? WORKER_RATE;
  };

  const workerRankingData = useMemo(
    () =>
      (charts?.worker_payments ?? []).map((wp) => ({
        name: wp.worker.name,
        value: wp.total_kgs,
        jobs: wp.jobs.length,
        total_amount: getWorkerTotalPay(wp),
      })),
    [charts, workGroupRatesMap],
  );

  const farmRankingData = useMemo(
    () =>
      (charts?.farm_performance ?? []).map((fp) => ({
        name: fp.farm.name,
        value: fp.total_kgs,
        size: (fp.size * HA_TO_ACRES).toFixed(1),
        zone: fp.farm.zone,
      })),
    [charts],
  );

  const { data: workersData } = useWorkers({ per_page: 100 });
  const { data: supervisorsData } = useHrisUsers({ role: "supervisor", per_page: 100 } as any);

  const workerOptions = workersData?.data ?? [];
  const supervisorOptions = supervisorsData?.data ?? [];

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
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              <label className="block text-xs text-gray-500 mb-1">Work Group</label>
              <select
                value={workGroupId}
                onChange={(e) => setWorkGroupId(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Work Groups</option>
                {workGroups.map((wg) => (
                  <option key={wg.id} value={wg.id}>
                    {wg.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Worker</label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Workers</option>
                {workerOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Supervisor</label>
              <select
                value={supervisorId}
                onChange={(e) => setSupervisorId(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Supervisors</option>
                {supervisorOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
              <div className="text-sm flex justify-between gap-6">
                <span className="text-gray-600">Total Pay:</span>
                <span className="font-bold text-gray-900">
                  KES {(item.total_amount ?? 0).toLocaleString()}
                </span>
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

      Worker Payment Breakdown
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Worker Payment Breakdown
        </h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : !charts?.worker_payments?.length ? (
          <p className="text-sm text-gray-400 text-center py-12">
            No worker payment data available for this period
          </p>
        ) : (
          <div className="space-y-2">
            {charts.worker_payments.map((wp) => {
              const isExpanded = expandedWorker === wp.worker.id;
              return (
                <div
                  key={wp.worker.id}
                  className="border border-gray-100 rounded-lg overflow-hidden"
                >
                  {/* Worker header row */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    onClick={() =>
                      setExpandedWorker(isExpanded ? null : wp.worker.id)
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-700">
                          {wp.worker.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {wp.worker.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {wp.worker.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 ml-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Total Kgs
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {wp.total_kgs.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Total Pay
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          KES {getWorkerTotalPay(wp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Days
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {wp.jobs.length}
                        </p>
                      </div>
                      {isExpanded ? (
                        <MdExpandLess className="w-5 h-5 text-gray-400 shrink-0" />
                      ) : (
                        <MdExpandMore className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Expanded job breakdown */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-t border-gray-100">
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Date
                            </th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Role
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Kgs
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Rate
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {wp.jobs.map((job, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-2 text-gray-700">
                                {new Date(job.date).toLocaleDateString(
                                  "en-KE",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    job.role === "supervisor"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {job.role}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right text-gray-700 font-medium">
                                {job.kgs.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-500">
                                KES {getJobRate(wp)}
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-gray-800">
                                KES {(job.kgs * getJobRate(wp)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={2}
                              className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide"
                            >
                              Totals
                            </td>
                            <td className="px-4 py-2 text-right text-xs font-bold text-gray-800">
                              {wp.total_kgs.toLocaleString()}
                            </td>
                            <td className="px-4 py-2" />
                            <td className="px-4 py-2 text-right text-xs font-bold text-emerald-600">
                              KES {getWorkerTotalPay(wp).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Production Section */}
      {showPaymentTab && charts?.schedule_production && charts.schedule_production.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Work Schedules & Payments
          </h3>
          <div className="space-y-2">
            {charts.schedule_production.map((schedule) => {
              const isExpanded = expandedScheduleId === schedule.schedule.id;
              return (
                <div
                  key={schedule.schedule.id}
                  className="border border-gray-100 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    onClick={() =>
                      setExpandedScheduleId(
                        isExpanded ? null : schedule.schedule.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <FiCalendar className="w-4 h-4 text-blue-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {schedule.schedule.code} - {schedule.farm.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {schedule.supervisor.name} •{" "}
                          {new Date(
                            schedule.scheduled_date,
                          ).toLocaleDateString("en-KE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 ml-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Workers
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {schedule.bookings.length}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Workers Pay
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          KES{" "}
                          {schedule.total_workers_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Supervisor
                        </p>
                        <p className="text-sm font-bold text-blue-600">
                          KES {schedule.supervisor_amount.toLocaleString()}
                        </p>
                      </div>
                      {isExpanded ? (
                        <MdExpandLess className="w-5 h-5 text-gray-400 shrink-0" />
                      ) : (
                        <MdExpandMore className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-t border-gray-100">
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Worker
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Farm Kgs
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Factory Kgs
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Kgs to Pay
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Rate
                            </th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {schedule.bookings.map((booking) => (
                            <tr
                              key={booking.booking.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-2 text-gray-700 font-medium">
                                {booking.worker.name}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-600">
                                {booking.farm_qty.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-600">
                                {booking.factory_qty.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-700 font-semibold">
                                {booking.kgs_to_pay.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-500">
                                KES {booking.rate}
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-emerald-600">
                                KES {booking.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={1}
                              className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide"
                            >
                              Totals
                            </td>
                            <td className="px-4 py-2 text-right text-xs font-bold text-gray-800">
                              {schedule.total_farm_kgs.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-xs font-bold text-gray-800">
                              {schedule.total_factory_kgs.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-xs font-bold text-gray-800">
                              {Math.min(
                                schedule.total_farm_kgs,
                                schedule.total_factory_kgs,
                              ).toLocaleString()}
                            </td>
                            <td className="px-4 py-2" />
                            <td className="px-4 py-2 text-right text-xs font-bold text-emerald-600">
                              KES{" "}
                              {schedule.total_workers_amount.toLocaleString()}
                            </td>
                          </tr>
                          <tr className="bg-blue-50 border-t border-gray-200">
                            <td
                              colSpan={5}
                              className="px-4 py-2 text-xs font-bold text-blue-800 uppercase tracking-wide"
                            >
                              Supervisor Payment (Total Kgs × KES{" "}
                              {SUPERVISOR_RATE})
                            </td>
                            <td className="px-4 py-2 text-right text-xs font-bold text-blue-600">
                              KES {schedule.supervisor_amount.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Activation Tab */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Process worker and supervisor payments
              </p>
              <button
                className="px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg cursor-not-allowed opacity-50"
                disabled
              >
                Activate Payments (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Tab for Payment View */}
      {charts?.schedule_production && charts.schedule_production.length > 0 && (
        <div className="bg-white rounded-lg shadow p-2">
          <button
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showPaymentTab
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setShowPaymentTab(!showPaymentTab)}
          >
            {showPaymentTab ? "← Back to Overview" : "View Schedules & Payments →"}
          </button>
        </div>
      )}
    </div>
  );
}
