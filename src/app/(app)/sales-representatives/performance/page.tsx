"use client";

import { useState, useCallback } from "react";
import {
  MdShoppingCart,
  MdAccountBalanceWallet,
  MdPaid,
  MdPictureAsPdf,
  MdPerson,
  MdFilterList,
  MdClose,
  MdPending,
  MdWarning,
} from "react-icons/md";
import StatCard from "@/components/common/StatCard";
import PerformanceReportModal from "@/components/common/PerformanceReportModal";
import type { PerformanceReportParams } from "@/components/common/PerformanceReportModal";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";
import { useSalesPerformance } from "@/hooks/useSalesPerformance";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/common/PageHeader";
import { formatCurrency, formatNumber, parseAbbreviatedNumber } from "@/utils/formatCurrency";
import { pdf } from "@react-pdf/renderer";
import {
  TotalOrdersReportPDF,
  DispatchedBalancesReportPDF,
  DispatchedPaidReportPDF,
} from "@/components/common/SalesPerformanceReportPDF";
import toast from "react-hot-toast";

type TabKey =
  | "total_orders"
  | "dispatched_balances"
  | "dispatched_paid"
  | "pending_orders"
  | "unassigned_orders";

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Payment" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

const DELIVERY_STATUS_OPTIONS = [
  { value: "", label: "All Delivery" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function SalesPerformancePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("total_orders");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { user } = useAuth();

  const { data, isLoading, error } = useSalesPerformance({
    payment_status: paymentStatus || undefined,
    delivery_status: deliveryStatus || undefined,
  });

  const activeFilterCount = [paymentStatus, deliveryStatus].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setPaymentStatus("");
    setDeliveryStatus("");
  };

  const handleGeneratePdf = useCallback(
    async (reportParams: PerformanceReportParams) => {
      if (!data) {
        toast.error("No data available to generate report");
        return;
      }

      setIsGeneratingPdf(true);
      try {
        const dateRange = {
          from: reportParams.dateFrom || undefined,
          to: reportParams.dateTo || undefined,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pdfElement: any;
        let fileName: string;

        if (reportParams.reportType === "total_orders") {
          pdfElement = (
            <TotalOrdersReportPDF
              data={data.total_orders.by_sales_person}
              dateRange={dateRange}
              generatedBy={user?.name}
              grandTotal={{
                total_orders_count: data.grand_total.total_orders_count,
                total_orders_value: data.grand_total.total_orders_value,
              }}
            />
          );
          fileName = "sales-performance-total-orders";
        } else if (reportParams.reportType === "dispatched_balances") {
          pdfElement = (
            <DispatchedBalancesReportPDF
              data={data.dispatched_with_balances.by_sales_person}
              dateRange={dateRange}
              generatedBy={user?.name}
              grandTotal={{
                total_dispatched_unpaid_balance:
                  data.dispatched_with_balances.summary
                    .total_outstanding_balance,
              }}
            />
          );
          fileName = "sales-performance-unpaid-balances";
        } else {
          pdfElement = (
            <DispatchedPaidReportPDF
              data={data.dispatched_paid.by_sales_person}
              dateRange={dateRange}
              generatedBy={user?.name}
              summary={{
                total_paid_orders_count:
                  data.dispatched_paid.summary.breakdown.fully_paid_orders,
                total_paid_value:
                  data.dispatched_paid.summary.total_paid_value -
                  (data.dispatched_with_balances?.summary?.total_paid || 0),
              }}
            />
          );
          fileName = "sales-performance-paid-orders";
        }

        const blob = await pdf(pdfElement).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateStr = new Date().toISOString().split("T")[0];
        link.download = `${fileName}-${dateStr}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded successfully");
        setShowReportModal(false);
      } catch {
        toast.error("Failed to generate report");
      } finally {
        setIsGeneratingPdf(false);
      }
    },
    [data, user?.name],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden px-3 md:px-6 pt-2 pb-20 md:pb-2">
      <div className="mb-4 shrink-0">
        <PageHeader
          title="Sales Rep Performance"
          description="Track and analyze sales representative performance metrics"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  activeFilterCount > 0
                    ? "border-accent text-accent bg-accent/5"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MdFilterList className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                disabled={isGeneratingPdf || isLoading || !data}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MdPictureAsPdf className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Grand Total Info Cards */}
      {data?.grand_total && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4 shrink-0">
          <StatCard
            title="Total Orders"
            mainValue={formatNumber(data.grand_total.total_orders_value)}
            subtitle={`${data.grand_total.total_orders_count} orders`}
          >
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MdShoppingCart className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600" />
            </div>
          </StatCard>

          <StatCard
            title="Total Paid"
            mainValue={formatNumber(data.grand_total.total_amount_paid)}
            subtitle={`${data.grand_total.by_payment_status?.find((s) => s.status === "paid")?.count || 0} paid orders`}
          >
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <MdPaid className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
            </div>
          </StatCard>

          <StatCard
            title="Total Outstanding"
            mainValue={formatNumber(data.grand_total.total_outstanding)}
            subtitle={`${data.grand_total.by_payment_status?.filter((s) => s.status !== "paid").reduce((sum, s) => sum + s.count, 0) || 0} unpaid/partial orders`}
          >
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <MdWarning className="w-3.5 h-3.5 md:w-5 md:h-5 text-orange-600" />
            </div>
          </StatCard>

          <StatCard
            title="Dispatched Orders"
            mainValue={formatNumber(
              parseAbbreviatedNumber(
                data.grand_total.by_delivery_status?.find(
                  (s) => s.status === "dispatched",
                )?.total_paid || 0,
              ) +
                parseAbbreviatedNumber(
                  (data.total_dispatched_orders?.summary
                    ?.total_dispatched_value || 0) -
                    (data.grand_total.by_delivery_status?.find(
                      (s) => s.status === "dispatched",
                    )?.total_paid || 0),
                ),
            )}
            subtitle={
              <div className="text-xs">
                <span className="text-gray-500">
                  ({data.total_dispatched_orders?.summary
                    ?.total_dispatched_count || 0}{" "}
                  dispatched · {data.grand_total.by_delivery_status?.find(
                    (s) => s.status === "pending",
                  )?.count || 0}{" "}
                  pending)
                </span>
                <div className="mt-0.5">
                  <span>Paid: </span>
                  <span className="text-green-600 font-medium">
                    {formatNumber(
                      data.grand_total.by_delivery_status?.find(
                        (s) => s.status === "dispatched",
                      )?.total_paid || 0,
                    )}
                  </span>
                  <span className="mx-1 text-accent">|</span>
                  <span className="text-red-600">
                    Unpaid:
                    <span className="text-red-600 font-bold">
                      {" "}{formatNumber(
                        data.dispatched_with_balances?.summary
                          ?.total_outstanding_balance || 0,
                      )}
                    </span>
                  </span>
                </div>
              </div>
            }
          >
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <MdShoppingCart className="w-3.5 h-3.5 md:w-5 md:h-5 text-purple-600" />
            </div>
          </StatCard>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className={`px-3 py-1.5 border rounded-lg text-sm ${
                paymentStatus
                  ? "border-accent text-accent"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
              className={`px-3 py-1.5 border rounded-lg text-sm ${
                deliveryStatus
                  ? "border-accent text-accent"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              {DELIVERY_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <MdClose className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs + Content */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
        className="flex-1 min-h-0 flex flex-col"
      >
        <TabsList className="shrink-0">
          <TabsTrigger
            value="total_orders"
            icon={<MdShoppingCart className="w-4 h-4" />}
          >
            All Orders
          </TabsTrigger>
          <TabsTrigger
            value="dispatched_balances"
            icon={<MdAccountBalanceWallet className="w-4 h-4" />}
          >
            Dispatched Unpaid
          </TabsTrigger>
          <TabsTrigger
            value="dispatched_paid"
            icon={<MdPaid className="w-4 h-4" />}
          >
            Dispatched Paid
          </TabsTrigger>
          <TabsTrigger
            value="pending_orders"
            icon={<MdPending className="w-4 h-4" />}
          >
            Pending Dispatch
          </TabsTrigger>
          <TabsTrigger
            value="unassigned_orders"
            icon={<MdWarning className="w-4 h-4" />}
          >
            Without Sales Rep
          </TabsTrigger>
        </TabsList>

        {/* Loading / Error */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading performance data...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-500 text-sm">
              Failed to load performance data. Please try again.
            </p>
          </div>
        ) : (
          <>
            {/* Total Orders Tab */}
            <TabsContent
              value="total_orders"
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
                {/* Mobile Card View */}
                <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                  {data?.total_orders?.by_sales_person?.map((item, idx) => (
                    <div
                      key={item.sales_person_id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <MdPerson className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.sales_person_name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            #{idx + 1} · {item.employee_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-gray-400 text-[10px]">
                            Orders
                          </span>
                          <p className="font-semibold text-gray-900">
                            {item.total_orders.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 text-[10px]">
                            Total Value
                          </span>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(item.total_order_value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!data?.total_orders?.by_sales_person ||
                    data.total_orders.by_sales_person.length === 0) && (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No data available
                    </div>
                  )}
                  {data?.total_orders?.by_sales_person &&
                    data.total_orders.by_sales_person.length > 0 && (
                      <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-semibold text-gray-900">
                            Grand Total (
                            {data.total_orders.by_sales_person.length} reps)
                          </p>
                          <div className="text-right">
                            <p className="text-gray-500">
                              {data.grand_total.total_orders_count.toLocaleString()}{" "}
                              orders
                            </p>
                            <p className="font-bold text-gray-900">
                              {formatCurrency(
                                data.grand_total.total_orders_value,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales Person
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Employee No.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data?.total_orders?.by_sales_person?.map((item, idx) => (
                        <tr
                          key={item.sales_person_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-400 text-sm">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <MdPerson className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.sales_person_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                            {item.employee_number}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            {item.total_orders.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            {formatCurrency(item.total_order_value)}
                          </td>
                        </tr>
                      ))}
                      {(!data?.total_orders?.by_sales_person ||
                        data.total_orders.by_sales_person.length === 0) && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {data?.total_orders?.by_sales_person &&
                      data.total_orders.by_sales_person.length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={3}
                              className="px-4 py-3 text-sm font-semibold text-gray-900"
                            >
                              Grand Total (
                              {data.total_orders.by_sales_person.length} sales
                              reps)
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              {data.grand_total.total_orders_count.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              {formatCurrency(
                                data.grand_total.total_orders_value,
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Dispatched Balances Tab */}
            <TabsContent
              value="dispatched_balances"
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
                {/* Mobile Card View */}
                <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                  {(data?.dispatched_with_balances?.by_sales_person || [])
                    .filter((item) => item.dispatched_orders_count > 0)
                    .map((item, idx) => (
                      <div
                        key={item.sales_person_id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <MdPerson className="w-3.5 h-3.5 text-red-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.sales_person_name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              #{idx + 1} · {item.employee_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-400 text-[10px]">
                              Dispatched
                            </span>
                            <p className="font-semibold text-gray-900">
                              {item.dispatched_orders_count.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[10px]">
                              Partial Paid
                            </span>
                            <p className="font-bold text-green-600">
                              {formatCurrency(item.total_paid)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[10px]">
                              Outstanding
                            </span>
                            <p className="font-bold text-red-600">
                              {formatCurrency(item.total_balance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {(!data?.dispatched_with_balances?.by_sales_person ||
                    data.dispatched_with_balances.by_sales_person.filter(
                      (item) => item.dispatched_orders_count > 0,
                    ).length === 0) && (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No outstanding balances found
                    </div>
                  )}
                  {data?.dispatched_with_balances?.by_sales_person &&
                    data.dispatched_with_balances.by_sales_person.filter(
                      (item) => item.dispatched_orders_count > 0,
                    ).length > 0 && (
                      <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                        <div className="text-xs mb-2">
                          <p className="font-semibold text-gray-900">
                            Grand Total (
                            {
                              data.dispatched_with_balances.by_sales_person.filter(
                                (item) => item.dispatched_orders_count > 0,
                              ).length
                            }{" "}
                            reps)
                          </p>
                          <p className="text-gray-500">
                            {data.dispatched_with_balances.by_sales_person
                              .filter(
                                (item) => item.dispatched_orders_count > 0,
                              )
                              .reduce(
                                (sum, item) =>
                                  sum + item.dispatched_orders_count,
                                0,
                              )
                              .toLocaleString()}{" "}
                            orders with balances
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="text-center">
                            <span className="text-gray-500 block">
                              Partial Payments
                            </span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(
                                data.dispatched_with_balances.by_sales_person
                                  .filter(
                                    (item) => item.dispatched_orders_count > 0,
                                  )
                                  .reduce(
                                    (sum, item) => sum + item.total_paid,
                                    0,
                                  ),
                              )}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-500 block">
                              Outstanding
                            </span>
                            <span className="font-bold text-red-600">
                              {formatCurrency(
                                data.dispatched_with_balances.by_sales_person
                                  .filter(
                                    (item) => item.dispatched_orders_count > 0,
                                  )
                                  .reduce(
                                    (sum, item) => sum + item.total_balance,
                                    0,
                                  ),
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <div className="text-center">
                            <span className="text-gray-500 text-[10px] block">
                              Note: These are partial payments on orders with
                              outstanding balances
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales Person
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Employee No.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dispatched Orders
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partial Payments
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outstanding Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(data?.dispatched_with_balances?.by_sales_person || [])
                        .filter((item) => item.dispatched_orders_count > 0)
                        .map((item, idx) => (
                          <tr
                            key={item.sales_person_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                  <MdPerson className="w-3.5 h-3.5 text-red-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.sales_person_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                              {item.employee_number}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {item.dispatched_orders_count.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                              {formatCurrency(item.total_paid)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                              {formatCurrency(item.total_balance)}
                            </td>
                          </tr>
                        ))}
                      {(!data?.dispatched_with_balances?.by_sales_person ||
                        data.dispatched_with_balances.by_sales_person.filter(
                          (item) => item.dispatched_orders_count > 0,
                        ).length === 0) && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No outstanding balances found
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {data?.dispatched_with_balances?.by_sales_person &&
                      data.dispatched_with_balances.by_sales_person.filter(
                        (item) => item.dispatched_orders_count > 0,
                      ).length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={3}
                              className="px-4 py-3 text-sm font-semibold text-gray-900"
                            >
                              Grand Total (
                              {
                                data.dispatched_with_balances.by_sales_person.filter(
                                  (item) => item.dispatched_orders_count > 0,
                                ).length
                              }{" "}
                              sales reps)
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              {data.dispatched_with_balances.by_sales_person
                                .filter(
                                  (item) => item.dispatched_orders_count > 0,
                                )
                                .reduce(
                                  (sum, item) =>
                                    sum + item.dispatched_orders_count,
                                  0,
                                )
                                .toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                              {formatCurrency(
                                data.dispatched_with_balances.by_sales_person
                                  .filter(
                                    (item) => item.dispatched_orders_count > 0,
                                  )
                                  .reduce(
                                    (sum, item) => sum + item.total_paid,
                                    0,
                                  ),
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                              {formatCurrency(
                                data.dispatched_with_balances.by_sales_person
                                  .filter(
                                    (item) => item.dispatched_orders_count > 0,
                                  )
                                  .reduce(
                                    (sum, item) => sum + item.total_balance,
                                    0,
                                  ),
                              )}
                            </td>
                          </tr>
                          <tr className="bg-gray-100">
                            <td
                              colSpan={6}
                              className="px-4 py-2 text-center text-xs text-gray-600"
                            >
                              Note: Partial payments shown are on orders with
                              outstanding balances
                            </td>
                          </tr>
                        </tfoot>
                      )}
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Dispatched Paid Tab */}
            <TabsContent
              value="dispatched_paid"
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
                {/* Mobile Card View */}
                <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                  {(data?.dispatched_paid?.by_sales_person || [])
                    .filter(
                      (item) =>
                        item.paid_orders_count > 0 &&
                        item.partially_paid_orders_count === 0,
                    )
                    .map((item, idx) => (
                      <div
                        key={item.sales_person_id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                            <MdPerson className="w-3.5 h-3.5 text-green-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.sales_person_name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              #{idx + 1} · {item.employee_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-400 text-[10px]">
                              Paid Orders
                            </span>
                            <p className="font-semibold text-gray-900">
                              {item.paid_orders_count.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[10px]">
                              Paid Value
                            </span>
                            <p className="font-bold text-green-600">
                              {formatCurrency(item.total_paid_value)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {(!data?.dispatched_paid?.by_sales_person ||
                    data.dispatched_paid.by_sales_person.filter(
                      (item) =>
                        item.paid_orders_count > 0 &&
                        item.partially_paid_orders_count === 0,
                    ).length === 0) && (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No paid orders found
                    </div>
                  )}
                  {data?.dispatched_paid?.by_sales_person &&
                    data.dispatched_paid.by_sales_person.filter(
                      (item) =>
                        item.paid_orders_count > 0 &&
                        item.partially_paid_orders_count === 0,
                    ).length > 0 && (
                      <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-semibold text-gray-900">
                            Grand Total (
                            {
                              data.dispatched_paid.by_sales_person.filter(
                                (item) =>
                                  item.paid_orders_count > 0 &&
                                  item.partially_paid_orders_count === 0,
                              ).length
                            }{" "}
                            reps)
                          </p>
                          <div className="text-right">
                            <p className="text-gray-500">
                              {data.dispatched_paid.summary.breakdown.fully_paid_orders.toLocaleString()}{" "}
                              orders
                            </p>
                            <p className="font-bold text-green-600">
                              {formatCurrency(
                                data.dispatched_paid.summary.total_paid_value -
                                  (data.dispatched_with_balances?.summary
                                    ?.total_paid || 0),
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales Person
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Employee No.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid Orders
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(data?.dispatched_paid?.by_sales_person || [])
                        .filter(
                          (item) =>
                            item.paid_orders_count > 0 &&
                            item.partially_paid_orders_count === 0,
                        )
                        .map((item, idx) => (
                          <tr
                            key={item.sales_person_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                  <MdPerson className="w-3.5 h-3.5 text-green-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.sales_person_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                              {item.employee_number}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {item.paid_orders_count.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                              {formatCurrency(item.total_paid_value)}
                            </td>
                          </tr>
                        ))}
                      {(!data?.dispatched_paid?.by_sales_person ||
                        data.dispatched_paid.by_sales_person.filter(
                          (item) =>
                            item.paid_orders_count > 0 &&
                            item.partially_paid_orders_count === 0,
                        ).length === 0) && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No paid orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {data?.dispatched_paid?.by_sales_person &&
                      data.dispatched_paid.by_sales_person.filter(
                        (item) =>
                          item.paid_orders_count > 0 &&
                          item.partially_paid_orders_count === 0,
                      ).length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={3}
                              className="px-4 py-3 text-sm font-semibold text-gray-900"
                            >
                              Grand Total (
                              {
                                data.dispatched_paid.by_sales_person.filter(
                                  (item) =>
                                    item.paid_orders_count > 0 &&
                                    item.partially_paid_orders_count === 0,
                                ).length
                              }{" "}
                              sales reps)
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              {data.dispatched_paid.summary.breakdown.fully_paid_orders.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                              {formatCurrency(
                                data.dispatched_paid.summary.total_paid_value -
                                  (data.dispatched_with_balances?.summary
                                    ?.total_paid || 0),
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Pending Orders Tab */}
            <TabsContent
              value="pending_orders"
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
                {/* Mobile Card View */}
                <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                  {(data?.pending_orders?.by_sales_person || [])
                    .filter((item) => item.pending_orders_count > 0)
                    .map((item, idx) => (
                      <div
                        key={item.sales_person_id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                            <MdPerson className="w-3.5 h-3.5 text-yellow-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.sales_person_name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              #{idx + 1} · {item.employee_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div>
                            <span className="text-gray-400 text-[10px]">
                              Pending
                            </span>
                            <p className="font-semibold text-gray-900">
                              {item.pending_orders_count.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[10px]">
                              Total Value
                            </span>
                            <p className="font-bold text-gray-900">
                              {formatCurrency(item.total_pending_value)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-400 text-[10px]">
                              Already Paid
                            </span>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(item.pending_but_paid_value)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[10px]">
                              Not Yet Paid
                            </span>
                            <p className="font-bold text-orange-600">
                              {formatCurrency(item.pending_and_unpaid_value)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {(!data?.pending_orders?.by_sales_person ||
                    data.pending_orders.by_sales_person.filter(
                      (item) => item.pending_orders_count > 0,
                    ).length === 0) && (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No orders pending dispatch
                    </div>
                  )}
                  {data?.pending_orders?.by_sales_person &&
                    data.pending_orders.by_sales_person.filter(
                      (item) => item.pending_orders_count > 0,
                    ).length > 0 && (
                      <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <p className="font-semibold text-gray-900">
                            Grand Total (
                            {
                              data.pending_orders.by_sales_person.filter(
                                (item) => item.pending_orders_count > 0,
                              ).length
                            }{" "}
                            reps)
                          </p>
                          <p className="text-gray-500">
                            {data.pending_orders.summary.total_pending_orders_count.toLocaleString()}{" "}
                            orders
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-400 text-[10px]">
                              Already Paid
                            </span>
                            <p className="font-bold text-green-600">
                              {formatCurrency(
                                data.pending_orders.summary
                                  .pending_but_already_paid_value,
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[10px]">
                              Not Yet Paid
                            </span>
                            <p className="font-bold text-orange-600">
                              {formatCurrency(
                                data.pending_orders.summary
                                  .pending_and_unpaid_value,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales Person
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Employee No.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders Pending Dispatch
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Already Paid
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Not Yet Paid
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(data?.pending_orders?.by_sales_person || [])
                        .filter((item) => item.pending_orders_count > 0)
                        .map((item, idx) => (
                          <tr
                            key={item.sales_person_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                                  <MdPerson className="w-3.5 h-3.5 text-yellow-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.sales_person_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                              {item.employee_number}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {item.pending_orders_count.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(item.total_pending_value)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-green-600 hidden lg:table-cell">
                              {formatCurrency(item.pending_but_paid_value)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-orange-600">
                              {formatCurrency(item.pending_and_unpaid_value)}
                            </td>
                          </tr>
                        ))}
                      {(!data?.pending_orders?.by_sales_person ||
                        data.pending_orders.by_sales_person.filter(
                          (item) => item.pending_orders_count > 0,
                        ).length === 0) && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No orders pending dispatch
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {data?.pending_orders?.by_sales_person &&
                      data.pending_orders.by_sales_person.filter(
                        (item) => item.pending_orders_count > 0,
                      ).length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={3}
                              className="px-4 py-3 text-sm font-semibold text-gray-900"
                            >
                              Grand Total (
                              {
                                data.pending_orders.by_sales_person.filter(
                                  (item) => item.pending_orders_count > 0,
                                ).length
                              }{" "}
                              sales reps)
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              {data.pending_orders.summary.total_pending_orders_count.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              {formatCurrency(
                                data.pending_orders.summary.total_pending_value,
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-green-600 hidden lg:table-cell">
                              {formatCurrency(
                                data.pending_orders.summary
                                  .pending_but_already_paid_value,
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-orange-600">
                              {formatCurrency(
                                data.pending_orders.summary
                                  .pending_and_unpaid_value,
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Unassigned Orders Tab */}
            <TabsContent
              value="unassigned_orders"
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="space-y-4 overflow-y-auto flex-1">
                {/* Dispatched Unpaid Orders */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-red-50 border-b border-red-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-red-900 flex items-center gap-2">
                      <MdWarning className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        Dispatched Orders Not Yet Paid (No Sales Rep Assigned)
                      </span>
                      <span className="sm:hidden">
                        Dispatched Unpaid (No Rep)
                      </span>
                      <span className="ml-auto text-xs font-normal">
                        {data?.orders_without_sales_person?.dispatched_unpaid
                          ?.summary?.total_orders_count || 0}{" "}
                        orders
                        {" · "}
                        {formatCurrency(
                          data?.orders_without_sales_person?.dispatched_unpaid
                            ?.summary?.total_outstanding_balance || 0,
                        )}{" "}
                        outstanding
                      </span>
                    </h3>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden p-3 space-y-2">
                    {(
                      data?.orders_without_sales_person?.dispatched_unpaid
                        ?.orders || []
                    ).map((order, idx) => (
                      <div
                        key={order.order_id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {order.order_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              #{idx + 1} ·{" "}
                              {order.customer?.name || (
                                <span className="text-gray-400 italic">
                                  {order.customer?.issue || "No customer"}
                                </span>
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                              order.payment_status === "paid"
                                ? "bg-green-100 text-green-800"
                                : order.payment_status === "partially_paid"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div>
                            <span className="text-gray-400 text-[10px]">
                              Amount
                            </span>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(order.amount)}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-400 text-[10px]">
                              Paid
                            </span>
                            <p className="text-green-600">
                              {formatCurrency(order.amount_paid)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-[10px]">
                              Balance
                            </span>
                            <p className="font-bold text-red-600">
                              {formatCurrency(order.outstanding_balance || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!data?.orders_without_sales_person?.dispatched_unpaid
                      ?.orders ||
                      data?.orders_without_sales_person?.dispatched_unpaid
                        ?.orders.length === 0) && (
                      <div className="py-8 text-center text-gray-500 text-sm">
                        No dispatched unpaid orders without sales representative
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paid
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(
                          data?.orders_without_sales_person?.dispatched_unpaid
                            ?.orders || []
                        ).map((order, idx) => (
                          <tr key={order.order_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {order.order_number}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {order.customer?.name ? (
                                <>
                                  {order.customer.name}
                                  {order.customer.account_number && (
                                    <span className="text-xs text-gray-500 block">
                                      {order.customer.account_number}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 italic text-xs">
                                  {order.customer?.issue || "No customer"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                              {formatCurrency(order.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-green-600">
                              {formatCurrency(order.amount_paid)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                              {formatCurrency(order.outstanding_balance || 0)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  order.payment_status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : order.payment_status === "partially_paid"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-red-600">
                              {order.customer?.name
                                ? order.customer?.issue || "-"
                                : "-"}
                            </td>
                          </tr>
                        ))}
                        {(!data?.orders_without_sales_person?.dispatched_unpaid
                          ?.orders ||
                          data?.orders_without_sales_person?.dispatched_unpaid
                            ?.orders.length === 0) && (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No dispatched unpaid orders without sales
                              representative
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-yellow-900 flex items-center gap-2">
                      <MdPending className="w-4 h-4" />
                      Orders Pending Dispatch (No Sales Rep Assigned)
                      <span className="ml-auto text-xs font-normal">
                        {data?.orders_without_sales_person?.pending?.summary?.total_orders_count || 0} orders
                        {' · '}
                        {formatCurrency(data?.orders_without_sales_person?.pending?.summary?.total_value || 0)} total
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paid
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(data?.orders_without_sales_person?.pending?.orders || []).map((order, idx) => (
                          <tr key={order.order_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 text-sm">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {order.order_number}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {order.customer?.name ? (
                                <>
                                  {order.customer.name}
                                  {order.customer.account_number && (
                                    <span className="text-xs text-gray-500 block">
                                      {order.customer.account_number}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 italic text-xs">
                                  {order.customer?.issue || 'No customer'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                              {formatCurrency(order.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-green-600">
                              {formatCurrency(order.amount_paid)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                order.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : order.payment_status === 'partially_paid'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-xs text-yellow-600">
                              {order.customer?.name ? (order.customer?.issue || '-') : '-'}
                            </td>
                          </tr>
                        ))}
                        {(!data?.orders_without_sales_person?.pending?.orders ||
                          data?.orders_without_sales_person?.pending?.orders.length === 0) && (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                              No orders pending dispatch without sales representative
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div> */}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
      {/* Performance Report Modal */}
      <PerformanceReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={handleGeneratePdf}
        isGenerating={isGeneratingPdf}
      />
    </div>
  );
}
