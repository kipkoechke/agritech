"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdClose,
  MdDashboard,
  MdPeople,
  MdShoppingCart,
  MdAttachMoney,
  MdTrendingUp,
  MdPerson,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdCalendarToday,
  MdRefresh,
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
import { useDepotDashboard } from "@/hooks/useDepotDashboard";
import { useDepotOrders } from "@/hooks/useDepotPortal";
import StatCard from "@/components/common/StatCard";
import Link from "next/link";

export default function DepotDashboardPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // Build params only when both dates are set
  const dateParams =
    startDate && endDate
      ? { start_date: startDate, end_date: endDate }
      : undefined;

  const { data, isLoading, error, refetch } = useDepotDashboard(dateParams);

  // Fetch recent paid orders for the table
  const { data: recentPaidOrders } = useDepotOrders({
    page: 1,
    per_page: 10,
    payment_status: "paid",
  });

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

  const now = new Date();

  const chartData = (data?.revenue_performance?.revenue_trend ?? [])
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
    return null;
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 pb-24 md:pb-4">
      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 shrink-0 mt-2 mx-4">
        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <MdDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900">
              Filter
            </h1>
            <MdFilterList className="w-4 h-4 text-gray-400" />
            {/* Period Badge */}
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-blue-50 rounded-full">
              <MdCalendarToday className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-600" />
              <span className="text-[10px] md:text-xs font-medium text-blue-700">
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
          <div className="border-t border-gray-100 px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
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
              <div>
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

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <StatCard
            title="Sales Reps"
            mainValue={data.overview.total_sales_reps}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MdPeople className="w-4 h-4 text-blue-600" />
            </div>
          </StatCard>

          <StatCard
            title="Customers"
            mainValue={data.overview.total_customers}
            subtitle={
              data.overview.new_customers > 0
                ? `+${data.overview.new_customers} New`
                : undefined
            }
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <MdPerson className="w-4 h-4 text-emerald-600" />
            </div>
          </StatCard>

          <StatCard
            title="Collected"
            mainValue={data.finance_performance.payments_collected}
            subtitle={`Pending: ${data.finance_performance.outstanding_receivables}`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <MdAttachMoney className="w-4 h-4 text-emerald-600" />
            </div>
          </StatCard>

          <StatCard
            title="All Orders Value"
            mainValue={data.overview.total_revenue}
            subtitle={`No. of Orders: ${data.overview.total_orders}`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <MdShoppingCart className="w-4 h-4 text-purple-600" />
            </div>
          </StatCard>
        </div>

        {/* Stock Management Quick Access */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MdDashboard className="w-5 h-5 text-primary" />
              Stock Management
            </h2>
            <Link
              href="/depot/stock/overview"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/depot/stock/requests/new"
              className="group bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:from-green-100 hover:to-green-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800 group-hover:text-green-900">Request Stock</h3>
                  <p className="text-sm text-green-600">Request from other depots</p>
                </div>
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center group-hover:bg-green-300">
                  <MdShoppingCart className="w-5 h-5 text-green-700" />
                </div>
              </div>
            </Link>

            <Link
              href="/depot/stock"
              className="group bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800 group-hover:text-blue-900">View Inventory</h3>
                  <p className="text-sm text-blue-600">Check current stock levels</p>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center group-hover:bg-blue-300">
                  <MdDashboard className="w-5 h-5 text-blue-700" />
                </div>
              </div>
            </Link>

            <Link
              href="/depot/stock/requests"
              className="group bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-800 group-hover:text-purple-900">Manage Requests</h3>
                  <p className="text-sm text-purple-600">Approve/review requests</p>
                </div>
                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center group-hover:bg-purple-300">
                  <MdPeople className="w-5 h-5 text-purple-700" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MdTrendingUp className="w-5 h-5 text-primary" />
                Revenue Trend
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
        </div>

        {/* Recent Paid Orders */}
        {recentPaidOrders && recentPaidOrders.data.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MdShoppingCart className="w-5 h-5 text-primary" />
                Recent Paid Orders
              </h2>
              <Link
                href="/depot/orders"
                className="text-sm text-primary hover:underline font-medium"
              >
                View All
              </Link>
            </div>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
              {recentPaidOrders.data.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/depot/orders/${order.id}`}
                  className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-primary">
                      {order.order_number}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{order.customer?.name || "-"}</span>
                    <span>
                      {new Date(order.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop Table */}
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
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Delivery
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPaidOrders.data.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/depot/orders/${order.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {order.customer?.name || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {order.items_count} item
                        {order.items_count !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.delivery_status)}`}
                        >
                          {order.delivery_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
