"use client";

import { useState, useMemo } from "react";
import { MdPayments, MdSearch, MdAccessTime, MdCheckCircle, MdPending, MdPeople } from "react-icons/md";
import PageHeader from "@/components/common/PageHeader";
import { useWorkerPaymentSummary } from "@/hooks/useWorkerPaymentSummary";
import { useSchedules } from "@/hooks/useSchedule";
import { usePaymentRequests } from "@/hooks/usePayment";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";

const PLUCKER_RATE = 9;
const SUPERVISOR_RATE = 2;

function getDefaultDateRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const toDate = now.toISOString().split("T")[0];
  const fromDate = firstDay.toISOString().split("T")[0];
  return { fromDate, toDate };
}

export default function WorkerPaymentsPage() {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("schedules");

  const { data: paymentData, isLoading: paymentLoading, error: paymentError } = useWorkerPaymentSummary({
    from_date: fromDate,
    to_date: toDate,
    search: search || undefined,
  });

  const { data: schedulesData, isLoading: schedulesLoading } = useSchedules({
    page: 1,
    per_page: 50,
    sort_by: "scheduled_date",
    sort_order: "desc",
  });

  const { data: paymentRequestsData, isLoading: paymentRequestsLoading } = usePaymentRequests({
    from_date: fromDate,
    to_date: toDate,
  });

  const summaries = paymentData?.data || [];
  const summary = paymentData?.summary;
  const schedules = schedulesData?.data || [];

  const totalKgs = summary?.total_kgs ?? summaries.reduce((sum, s) => sum + (s.total_kgs || 0), 0);

  const totalAmount = useMemo(() => {
    return summaries.reduce((sum, item) => {
      const isSupervisor = item.worker.role === "supervisor";
      const rate = isSupervisor ? SUPERVISOR_RATE : PLUCKER_RATE;
      return sum + (item.total_kgs || 0) * rate;
    }, 0);
  }, [summaries]);

  const totalPaid = useMemo(() => {
    return totalAmount * 0.7;
  }, [totalAmount]);

  const totalPending = useMemo(() => {
    return totalAmount * 0.3;
  }, [totalAmount]);

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
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-32 pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-28 border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-28 border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules" icon={<MdAccessTime />}>
            Schedules
          </TabsTrigger>
          <TabsTrigger value="payment-requests" icon={<MdPending />}>
            Payment Requests
          </TabsTrigger>
          <TabsTrigger value="transactions" icon={<MdCheckCircle />}>
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Schedules Table */}
        <TabsContent value="schedules">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {schedulesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No schedules found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Workers
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Paid
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map((schedule) => {
                      const totalWorkers = schedule.bookings_count || 0;
                      const amount = totalWorkers * 500;
                      const paid = amount * 0.7;
                      const pending = amount * 0.3;
                      return (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary">
                              {schedule.reference_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <MdPeople className="w-4 h-4 text-gray-400" />
                              {totalWorkers}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-emerald-600">
                              KSh {paid.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-amber-600">
                              KSh {pending.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                schedule.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : schedule.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Payment Requests Tab */}
        <TabsContent value="payment-requests">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {paymentRequestsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : !paymentRequestsData?.data?.length ? (
              <div className="p-8 text-center text-gray-500">
                No payment requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Workers</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Farm Kgs</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Factory Kgs</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentRequestsData.data.map((pr: any) => (
                      <tr key={pr.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary">{pr.reference_code || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {pr.scheduled_date ? new Date(pr.scheduled_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{pr.activity?.name || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{pr.farm?.name || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{pr.total_workers || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">{pr.total_farm_kgs?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">{pr.total_factory_kgs?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-emerald-600">{(pr.total_amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-emerald-600">{(pr.amount_paid || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-amber-600">{(pr.pending_amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            pr.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            pr.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            pr.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            pr.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {pr.status?.charAt(0).toUpperCase() + pr.status?.slice(1) || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            Transactions will be displayed here.
          </div>
        </TabsContent>
      </Tabs>
    </div>
);
}