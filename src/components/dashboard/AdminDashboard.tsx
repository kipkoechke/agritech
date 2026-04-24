"use client";

import { useState, useMemo } from "react";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdminDashboard } from "@/hooks/useRoleDashboard";
import { useZones } from "@/hooks/useZone";
import { useZoneFactories } from "@/hooks/useFactory";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useFarms } from "@/hooks/useFarm";
import { useWorkers } from "@/hooks/useWorkers";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import StatCard from "@/components/common/StatCard";
import RankingChart from "@/components/common/RankingChart";

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

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

const SkeletonBox = ({ h = 16 }: { h?: number }) => (
  <div
    className="bg-gray-200 animate-pulse rounded"
    style={{ height: `${h}px` }}
  />
);

export default function AdminDashboard() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState(formatDate(thirtyDaysAgo));
  const [toDate, setToDate] = useState(formatDate(today));
  const [zoneId, setZoneId] = useState("");
  const [factoryId, setFactoryId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [farmId, setFarmId] = useState("");
  const [workerId, setWorkerId] = useState("");

  // Filter data sources
  const { data: zonesData } = useZones();
  const { data: zoneFactoriesData, isLoading: factoriesLoading } =
    useZoneFactories(zoneId);
  const { data: supervisorsData, isLoading: supervisorsLoading } = useHrisUsers({
    role: "supervisor",
    per_page: 200,
  });
  const { data: farmersData, isLoading: farmersLoading } = useHrisUsers({
    role: "farmer",
    per_page: 200,
  });
  const { data: workersData, isLoading: workersLoading } = useWorkers({
    per_page: 200,
  });
  const { data: farmsData, isLoading: farmsLoading } = useFarms(
    { owner_id: farmerId, per_page: 200 },
    { enabled: !!farmerId },
  );

  const zoneOptions = [
    { value: "", label: "All Zones" },
    ...(zonesData || []).map((z) => ({ value: z.id, label: z.name })),
  ];

  const factoryOptions = [
    { value: "", label: "All Factories" },
    ...(zoneFactoriesData?.data ?? []).map((f) => ({
      value: f.id,
      label: `${f.name} (${f.code})`,
    })),
  ];

  const supervisorOptions = [
    { value: "", label: "All Supervisors" },
    ...(supervisorsData?.data ?? []).map((s) => ({ value: s.id, label: s.name })),
  ];

  const farmerOptions = [
    { value: "", label: "All Farmers" },
    ...(farmersData?.data ?? []).map((f) => ({ value: f.id, label: f.name })),
  ];

  const farmOptions = [
    { value: "", label: "All Farms" },
    ...(farmsData?.data ?? []).map((f) => ({ value: f.id, label: f.name })),
  ];

  const workerOptions = [
    { value: "", label: "All Workers" },
    ...(workersData?.data ?? []).map((w) => ({ value: w.id, label: w.name })),
  ];

  const params = useMemo(
    () => ({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      zone_id: zoneId || undefined,
      factory_id: factoryId || undefined,
      supervisor_id: supervisorId || undefined,
      farmer_id: farmerId || undefined,
      farm_id: farmId || undefined,
      worker_id: workerId || undefined,
    }),
    [fromDate, toDate, zoneId, factoryId, supervisorId, farmerId, farmId, workerId],
  );

  const { data, isLoading, isError } = useAdminDashboard(params);

  const summary = data?.summary;
  const charts = data?.charts;

  const activeFilterCount = [
    zoneId,
    factoryId,
    supervisorId,
    farmerId,
    farmId,
    workerId,
  ].filter(Boolean).length;

  // Prepare ranking data
  const zoneRankingData = useMemo(
    () =>
      (charts?.top_10_zone_distribution ?? []).map((z) => ({
        name: z.zone,
        value: z.kgs_collected,
        farms: z.farm_count,
        revenue: z.revenue,
      })),
    [charts],
  );

  const factoryRankingData = useMemo(
    () =>
      (charts?.top_10_factories ?? []).map((f) => ({
        name: f.name,
        value: f.total_kgs,
        code: f.code,
        zone: f.zone,
        workers: f.workers_count,
      })),
    [charts],
  );

  const farmRankingData = useMemo(
    () =>
      (charts?.top_10_farms ?? [])
        .filter((f) => f.farm != null)
        .map((f) => ({
          name: f.farm!.name,
          value: f.total_kgs,
          zone: f.farm!.zone,
          jobs: f.jobs,
        })),
    [charts],
  );

  const workerRankingData = useMemo(
    () =>
      (charts?.top_10_workers ?? []).map((w) => ({
        name: w.worker.name,
        value: w.total_kgs,
        jobs: w.jobs,
        avg: w.avg_kgs_per_job,
      })),
    [charts],
  );

  const bookingStatusData = useMemo(
    () =>
      charts?.booking_status
        ? [
            { name: "Confirmed", value: charts.booking_status.confirmed },
            { name: "Pending", value: charts.booking_status.pending },
            { name: "Completed", value: charts.booking_status.completed },
            {
              name: "Factory Received",
              value: charts.booking_status.factory_received,
            },
          ]
        : [],
    [charts],
  );

  const hasPieData = bookingStatusData.some((d) => d.value > 0);

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 text-sm">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Collapsible Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <button
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full text-left"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <FiFilter className="text-gray-400" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
              {activeFilterCount} active
            </span>
          )}
          <span className="ml-auto">
            {showFilters ? (
              <FiChevronUp className="text-gray-400" />
            ) : (
              <FiChevronDown className="text-gray-400" />
            )}
          </span>
        </button>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Zone */}
            <SearchableSelect
              label="Zone"
              options={zoneOptions}
              value={zoneId}
              onChange={(val) => {
                setZoneId(val);
                setFactoryId("");
                setSupervisorId("");
                setFarmerId("");
                setFarmId("");
              }}
              placeholder="All Zones"
            />

            {/* Factory */}
            <SearchableSelect
              label="Factory"
              options={factoryOptions}
              value={factoryId}
              onChange={(val) => {
                setFactoryId(val);
                setSupervisorId("");
                setFarmerId("");
                setFarmId("");
              }}
              placeholder="All Factories"
              isLoading={factoriesLoading}
            />

            {/* Supervisor */}
            <SearchableSelect
              label="Supervisor"
              options={supervisorOptions}
              value={supervisorId}
              onChange={(val) => {
                setSupervisorId(val);
                setFarmerId("");
                setFarmId("");
              }}
              placeholder="All Supervisors"
              isLoading={supervisorsLoading}
            />

            {/* Farmer */}
            <SearchableSelect
              label="Farmer"
              options={farmerOptions}
              value={farmerId}
              onChange={(val) => {
                setFarmerId(val);
                setFarmId("");
              }}
              placeholder="All Farmers"
              isLoading={farmersLoading}
            />

            {/* Farm */}
            <SearchableSelect
              label="Farm"
              options={farmOptions}
              value={farmId}
              onChange={setFarmId}
              placeholder="All Farms"
              isLoading={farmsLoading}
            />

            {/* Worker */}
            <SearchableSelect
              label="Worker"
              options={workerOptions}
              value={workerId}
              onChange={setWorkerId}
              placeholder="All Workers"
              isLoading={workersLoading}
            />

            {/* From Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Clear button */}
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setZoneId("");
                    setFactoryId("");
                    setSupervisorId("");
                    setFarmerId("");
                    setFarmId("");
                    setWorkerId("");
                  }}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* StatCards: KGs, Farmers, Factories, Bookings, Factory Qty */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-3 space-y-2">
                <SkeletonBox h={12} />
                <SkeletonBox h={24} />
              </div>
            ))
          : [
              {
                title: "Total Production",
                mainValue: `${(summary?.total_kgs ?? 0).toLocaleString()} Kgs`,
                subtitle: "Farm harvest",
              },
              {
                title: "Total Farmers",
                mainValue: summary?.total_farmers ?? 0,
                subtitle: `${summary?.total_farms ?? 0} farms`,
              },
              {
                title: "Total Factories",
                mainValue: summary?.total_factories ?? 0,
                subtitle: `${summary?.total_zones ?? 0} zones`,
              },
              {
                title: "Total Bookings",
                mainValue: summary?.total_bookings ?? 0,
                subtitle: `${summary?.completed_bookings ?? 0} done · ${summary?.pending_bookings ?? 0} pending`,
              },
              {
                title: "Factory Qty",
                mainValue: `${(summary?.factory_qty ?? 0).toLocaleString()} Kgs`,
                subtitle: "Received at factory",
              },
            ].map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                mainValue={card.mainValue}
                subtitle={card.subtitle}
              />
            ))}
      </div>

      {/* Ranking Charts Row A: Zones | Factories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingChart
          title="Top Zones by KGs Collected"
          data={zoneRankingData}
          loading={isLoading}
          color="#059669"
          borderColor="border-emerald-200"
          textColor="text-emerald-700"
          noDataMessage="No zone data for this period"
          metricLabel="KGs Collected"
          dataKey="name"
          renderTooltip={(d) => (
            <>
              <div className="font-bold text-emerald-700 mb-2">{d.name}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">KGs Collected</span>
                  <span className="font-bold">
                    {Number(d.value).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Farms</span>
                  <span className="font-bold">{d.farms}</span>
                </div>
              </div>
            </>
          )}
        />
        <RankingChart
          title="Top Factories by KG Throughput"
          data={factoryRankingData}
          loading={isLoading}
          color="#0891b2"
          borderColor="border-cyan-200"
          textColor="text-cyan-700"
          noDataMessage="No factory data for this period"
          metricLabel="Total KGs"
          dataKey="name"
          renderTooltip={(d) => (
            <>
              <div className="font-bold text-cyan-700 mb-2">
                {d.name} ({d.code})
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Zone</span>
                  <span className="font-bold">{d.zone}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Total KGs</span>
                  <span className="font-bold">
                    {Number(d.value).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Workers</span>
                  <span className="font-bold">{d.workers}</span>
                </div>
              </div>
            </>
          )}
        />
      </div>

      {/* Ranking Charts Row B: Farms | Workers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingChart
          title="Top Farms by KGs Collected"
          data={farmRankingData}
          loading={isLoading}
          color="#7c3aed"
          borderColor="border-violet-200"
          textColor="text-violet-700"
          noDataMessage="No farm data for this period"
          metricLabel="Total KGs"
          dataKey="name"
          renderTooltip={(d) => (
            <>
              <div className="font-bold text-violet-700 mb-2">{d.name}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Zone</span>
                  <span className="font-bold">{d.zone || "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Total KGs</span>
                  <span className="font-bold">
                    {Number(d.value).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Jobs</span>
                  <span className="font-bold">{d.jobs}</span>
                </div>
              </div>
            </>
          )}
        />
        <RankingChart
          title="Top Workers by KGs Collected"
          data={workerRankingData}
          loading={isLoading}
          color="#d97706"
          borderColor="border-amber-200"
          textColor="text-amber-700"
          noDataMessage="No worker data for this period"
          metricLabel="Total KGs"
          dataKey="name"
          renderTooltip={(d) => (
            <>
              <div className="font-bold text-amber-700 mb-2">{d.name}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Total KGs</span>
                  <span className="font-bold">
                    {Number(d.value).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Jobs</span>
                  <span className="font-bold">{d.jobs}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Avg KGs / Job</span>
                  <span className="font-bold">
                    {Number(d.avg ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </>
          )}
        />
      </div>

      {/* Trends Row: Daily Bookings + Booking Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Bookings Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Daily Bookings Trend
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBox key={i} h={16} />
              ))}
            </div>
          ) : (charts?.daily_bookings?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={charts!.daily_bookings}
                margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value, name) => [
                    Number(value ?? 0).toLocaleString(),
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#059669"
                  name="Bookings"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total_kgs"
                  stroke="#0891b2"
                  name="KGs"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          )}
        </div>

        {/* Booking Status Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Booking Status Distribution
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : hasPieData ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {bookingStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value) => [
                    Number(value ?? 0).toLocaleString(),
                    "",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
