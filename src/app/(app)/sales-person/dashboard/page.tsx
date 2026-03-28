"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdClose,
  MdDashboard,
  MdShoppingCart,
  MdTrendingUp,
  MdLocalShipping,
  MdPerson,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdCalendarToday,
  MdRefresh,
  MdVisibility,
  MdAttachMoney,
  MdCancel,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSalesManagerDashboard } from "@/hooks/useSalesManagerDashboard";
import StatCard from "@/components/common/StatCard";

export default function SalesPersonDashboardPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // Build params only when both dates are set
  const dateParams =
    startDate && endDate
      ? { start_date: startDate, end_date: endDate }
      : undefined;

  const { data, isLoading, error, refetch } =
    useSalesManagerDashboard(dateParams);

  const now = new Date();

  const chartData = (data?.orderTrend?.trend ?? [])
    .filter(({ date }) => {
      const d = new Date(date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .map(({ date, order_count, total_revenue }) => ({
      date: new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      orders: order_count,
      revenue: Number(total_revenue) || 0,
    }));

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "dispatched":
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "partially_paid":
        return "bg-amber-100 text-amber-800";
      case "pending":
        return "bg-slate-100 text-slate-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-600 font-medium">Failed to load dashboard</p>
          <p className="text-red-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-md text-center shadow-sm">
          <MdDashboard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-gray-900 font-medium text-lg mb-2">
            No Data Available
          </p>
          <p className="text-gray-500 text-sm mb-4">
            There is no dashboard data to display at the moment.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <MdRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50">
      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 shrink-0 mt-2 mx-2 md:mx-4">
        <div
          className="flex items-center justify-between px-2 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdDashboard className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">
              Filter
            </h1>
            <MdFilterList className="w-4 h-4 text-gray-400 shrink-0" />
            {/* Period Badge - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1 bg-blue-50 rounded-full">
              <MdCalendarToday className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {formatDate(data.period.start)} - {formatDate(data.period.end)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                refetch();
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <MdRefresh className="w-4 h-4" />
            </button>
            {isFilterExpanded ? (
              <MdExpandLess className="w-5 h-5 text-gray-500" />
            ) : (
              <MdExpandMore className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Collapsible Filter Content */}
        {isFilterExpanded && (
          <div className="border-t border-gray-100 px-2 md:px-4 py-3">
            {/* Mobile Period Badge */}
            <div className="md:hidden flex items-center gap-2 mb-3 px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
              <MdCalendarToday className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {formatDate(data.period.start)} - {formatDate(data.period.end)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 items-end">
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <button
                  onClick={handleClearFilters}
                  disabled={!startDate && !endDate}
                  aria-label="Clear Filters"
                  title="Clear Filters"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full flex items-center justify-center ${
                    startDate || endDate
                      ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                      : "text-gray-400 bg-gray-50 cursor-not-allowed"
                  }`}
                >
                  <MdClose className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 pb-24 md:pb-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          <StatCard
            title="Total Customers"
            mainValue={data.total_customers}
            subtitle={
              data.new_customers > 0 ? `+${data.new_customers} New` : undefined
            }
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <MdPerson className="w-4 h-4 text-emerald-600" />
            </div>
          </StatCard>

          <StatCard
            title="Total Orders"
            mainValue={data.order_stats.total}
            subtitle={`${data.order_stats.dispatched} Dispatched`}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MdShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
          </StatCard>

          <StatCard
            title="Pending Amount"
            mainValue={data.order_stats.pendingAmount}
            subtitle={`${data.order_stats.pendingPayment} Unpaid Orders`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <MdAttachMoney className="w-4 h-4 text-amber-600" />
            </div>
          </StatCard>

          <StatCard
            title="Ready for Delivery"
            mainValue={data.order_stats.readyForDelivery}
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <MdLocalShipping className="w-4 h-4 text-orange-600" />
            </div>
          </StatCard>

          <StatCard
            title="Void Orders"
            mainValue={data.order_stats.void}
            subtitle={`${data.order_stats.cancelled} Cancelled`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <MdCancel className="w-4 h-4 text-red-600" />
            </div>
          </StatCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          {/* Order Trend Chart */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MdTrendingUp className="w-5 h-5 text-primary" />
                Order Trend
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  label={{
                    value: "Date",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 12,
                    fill: "#000000",
                    fontWeight: "semi-bold",
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  allowDecimals={false}
                  width={45}
                  label={{
                    value: "No. of Orders",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                    fontSize: 12,
                    fill: "#000000",
                    fontWeight: "semi-bold",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
                          <p className="text-xs font-semibold text-gray-900 mb-1">
                            {label}
                          </p>
                          <p className="text-xs text-gray-600">
                            Orders:{" "}
                            <span className="font-medium text-blue-600">
                              {data.orders}
                            </span>
                          </p>
                          <p className="text-xs text-gray-600">
                            Revenue:{" "}
                            <span className="font-medium text-emerald-600">
                              KES {data.revenue.toLocaleString("en-KE")}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MdShoppingCart className="w-5 h-5 text-primary" />
                Recent Orders
              </h2>
              <Link
                href="/sales-person/orders"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
              {data.recent_orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/sales-person/orders/${order.id}`}
                  className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer_name}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(order.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getStatusColor(order.payment_status)}`}
                    >
                      {order.payment_status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getStatusColor(order.delivery_status)}`}
                    >
                      {order.delivery_status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      <span className="text-gray-400">Date:</span>{" "}
                      <span className="font-medium text-gray-700">
                        {formatDateTime(order.created_at)}
                      </span>
                    </span>
                    <span>
                      <span className="text-gray-400">Items:</span>{" "}
                      <span className="font-medium text-gray-700">
                        {order.items}
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
              {data.recent_orders.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No Recent Orders
                </p>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Order #
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Delivery
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.recent_orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Link
                          href={`/sales-person/orders/${order.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {order.customer_name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {order.items}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getStatusColor(order.payment_status)}`}
                        >
                          {order.payment_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getStatusColor(order.delivery_status)}`}
                        >
                          {order.delivery_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {formatDateTime(order.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        <Link
                          href={`/sales-person/orders/${order.id}`}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg inline-flex"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recent_orders.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No Recent Orders
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
