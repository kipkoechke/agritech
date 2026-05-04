"use client";

import { useState, useMemo } from "react";
import { MdPerson, MdSupervisorAccount } from "react-icons/md";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";
import PageHeader from "@/components/common/PageHeader";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useWorkers } from "@/hooks/useWorkers";
import { useAdminDashboard } from "@/hooks/useRoleDashboard";
import StatCard from "@/components/common/StatCard";
import RankingChart from "@/components/common/RankingChart";

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

const SkeletonBox = ({ h = 16 }: { h?: number }) => (
  <div
    className="bg-gray-200 animate-pulse rounded"
    style={{ height: `${h}px` }}
  />
);

export default function PerformancePage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [workerFromDate, setWorkerFromDate] = useState(formatDate(thirtyDaysAgo));
  const [workerToDate, setWorkerToDate] = useState(formatDate(today));
  const [workerId, setWorkerId] = useState("");

  const [supervisorFromDate, setSupervisorFromDate] = useState(formatDate(thirtyDaysAgo));
  const [supervisorToDate, setSupervisorToDate] = useState(formatDate(today));
  const [supervisorId, setSupervisorId] = useState("");

  const { data: supervisorsData, isLoading: supervisorsLoading } = useHrisUsers({
    role: "supervisor",
    per_page: 200,
  });
  const { data: workersData, isLoading: workersLoading } = useWorkers({
    per_page: 200,
  });

  const supervisorOptions = [
    { value: "", label: "All Supervisors" },
    ...(supervisorsData?.data ?? []).map((s) => ({
      value: s.id,
      label: s.name,
    })),
  ];

  const workerOptions = [
    { value: "", label: "All Workers" },
    ...(workersData?.data ?? []).map((w) => ({
      value: w.id,
      label: w.name,
    })),
  ];

  const activeWorkerFilterCount = [workerId].filter(Boolean).length;
  const activeSupervisorFilterCount = [supervisorId].filter(Boolean).length;

  const workerParams = useMemo(
    () => ({
      from_date: workerFromDate || undefined,
      to_date: workerToDate || undefined,
      worker_id: workerId || undefined,
    }),
    [workerFromDate, workerToDate, workerId],
  );

  const supervisorParams = useMemo(
    () => ({
      from_date: supervisorFromDate || undefined,
      to_date: supervisorToDate || undefined,
      supervisor_id: supervisorId || undefined,
    }),
    [supervisorFromDate, supervisorToDate, supervisorId],
  );

  const { data: workerData, isLoading: workerLoading } = useAdminDashboard(workerParams);
  const { data: supervisorData, isLoading: supervisorLoading } = useAdminDashboard(supervisorParams);

  const workerCharts = workerData?.charts;
  const supervisorCharts = supervisorData?.charts;

  const workerRankingData = useMemo(
    () =>
      (workerCharts?.top_10_workers ?? []).map((w) => ({
        name: w.worker?.name || "—",
        value: w.total_kgs,
        jobs: w.jobs,
        avg: w.avg_kgs_per_job,
        days: w.days_worked,
        farms: w.farms_worked,
      })),
    [workerCharts],
  );

  const supervisorRankingData = useMemo(() => {
    const supervisorsWithData = (supervisorCharts?.top_10_workers ?? []).map((w) => ({
      name: w.worker?.name || "—",
      value: w.total_kgs,
      jobs: w.jobs,
      avg: w.avg_kgs_per_job,
      days: w.days_worked,
      farms: w.farms_worked,
    }));
    return supervisorsWithData;
  }, [supervisorCharts]);

  const workerSummary = workerData?.summary;
  const supervisorSummary = supervisorData?.summary;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Performance"
        description="Track worker and supervisor performance metrics"
      />

      <Tabs defaultValue="worker">
        <TabsList>
          <TabsTrigger value="worker" icon={<MdPerson />}>
            Worker Performance
          </TabsTrigger>
          <TabsTrigger value="supervisor" icon={<MdSupervisorAccount />}>
            Supervisor Performance
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="worker">
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchableSelect
                  label="Worker"
                  options={workerOptions}
                  value={workerId}
                  onChange={setWorkerId}
                  placeholder="All Workers"
                  isLoading={workersLoading}
                />

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={workerFromDate}
                    onChange={(e) => setWorkerFromDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={workerToDate}
                    onChange={(e) => setWorkerToDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[42px]"
                  />
                </div>

                {activeWorkerFilterCount > 0 && (
                  <div className="flex items-end">
                    <button
                      onClick={() => setWorkerId("")}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {workerLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow p-3 space-y-2">
                        <SkeletonBox h={12} />
                        <SkeletonBox h={24} />
                      </div>
                    ))
                  : [
                      {
                        title: "Total Production",
                        mainValue: `${(workerSummary?.total_kgs ?? 0).toLocaleString()} Kgs`,
                        subtitle: "Harvest weight",
                      },
                      {
                        title: "Total Workers",
                        mainValue: workerSummary?.total_workers ?? 0,
                        subtitle: "Active workers",
                      },
                      {
                        title: "Revenue",
                        mainValue: `$${(workerSummary?.revenue ?? 0).toLocaleString()}`,
                        subtitle: "Total earnings",
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

              {/* Worker Ranking */}
              <RankingChart
                title="Top Workers by KGs Collected"
                data={workerRankingData}
                loading={workerLoading}
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
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Days Worked</span>
                        <span className="font-bold">{d.days}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Farms Worked</span>
                        <span className="font-bold">{d.farms}</span>
                      </div>
                    </div>
                  </>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="supervisor">
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchableSelect
                  label="Supervisor"
                  options={supervisorOptions}
                  value={supervisorId}
                  onChange={setSupervisorId}
                  placeholder="All Supervisors"
                  isLoading={supervisorsLoading}
                />

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={supervisorFromDate}
                    onChange={(e) => setSupervisorFromDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={supervisorToDate}
                    onChange={(e) => setSupervisorToDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[42px]"
                  />
                </div>

                {activeSupervisorFilterCount > 0 && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSupervisorId("");
                      }}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {supervisorLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow p-3 space-y-2">
                        <SkeletonBox h={12} />
                        <SkeletonBox h={24} />
                      </div>
                    ))
                  : [
                      {
                        title: "Total Production",
                        mainValue: `${(supervisorSummary?.total_kgs ?? 0).toLocaleString()} Kgs`,
                        subtitle: "Harvest weight",
                      },
                      {
                        title: "Total Workers",
                        mainValue: supervisorSummary?.total_workers ?? 0,
                        subtitle: "Under supervision",
                      },
                      {
                        title: "Total Bookings",
                        mainValue: supervisorSummary?.total_bookings ?? 0,
                        subtitle: `${supervisorSummary?.completed_bookings ?? 0} done · ${supervisorSummary?.pending_bookings ?? 0} pending`,
                      },
                      {
                        title: "Revenue",
                        mainValue: `$${(supervisorSummary?.revenue ?? 0).toLocaleString()}`,
                        subtitle: "Total earnings",
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

              {/* Supervisor Ranking */}
              <RankingChart
                title="Top Supervisors by KGs Collected"
                data={supervisorRankingData}
                loading={supervisorLoading}
                color="#7c3aed"
                borderColor="border-violet-200"
                textColor="text-violet-700"
                noDataMessage="No supervisor data for this period"
                metricLabel="Total KGs"
                dataKey="name"
                renderTooltip={(d) => (
                  <>
                    <div className="font-bold text-violet-700 mb-2">{d.name}</div>
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
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Days Worked</span>
                        <span className="font-bold">{d.days}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Farms Managed</span>
                        <span className="font-bold">{d.farms}</span>
                      </div>
                    </div>
                  </>
                )}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}