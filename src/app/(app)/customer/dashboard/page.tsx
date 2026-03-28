"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MdClose,
  MdDashboard,
  MdShoppingCart,
  MdPayment,
  MdPendingActions,
  MdCheckCircle,
  MdReceipt,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdCalendarToday,
  MdRefresh,
} from "react-icons/md";
import { useDistributorDashboard } from "@/hooks/useDistributorDashboard";
import type { DistributorDashboardOrder } from "@/types/distributorDashboard";

export default function CustomerDashboardPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // Build params only when both dates are set
  const dateRange =
    startDate && endDate ? { start_date: startDate, end_date: endDate } : {};

  const { data, isLoading, error, refetch } =
    useDistributorDashboard(dateRange);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `KES ${numPrice.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Paid
          </span>
        );
      case "partially_paid":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Partial
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Shipped
          </span>
        );
      case "processing":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Processing
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium">Failed to load dashboard</p>
          <p className="text-red-500 text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentOrders = data?.recent_orders || [];
  const period = data?.period;

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-100">
      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div
          className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdDashboard className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900">
              Dashboard
            </h1>
            <MdFilterList className="w-4 h-4 text-gray-400 shrink-0" />
            {/* Period Badge - Hidden on mobile, shown in filter section */}
            {period && (
              <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1 bg-blue-50 rounded-full">
                <MdCalendarToday className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {formatDate(period.start)} - {formatDate(period.end)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
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
          <div className="border-t border-gray-100 px-3 md:px-4 py-3">
            {/* Mobile Period Badge */}
            {period && (
              <div className="md:hidden flex items-center gap-2 mb-3 px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
                <MdCalendarToday className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {formatDate(period.start)} - {formatDate(period.end)}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 items-end">
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-2 md:px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
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
                  className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-2 md:px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
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

      {/* Actions Row - Hidden on mobile (bottom nav has this) */}
      <div className="bg-white border-b border-slate-200 px-3 md:px-4 py-2 shrink-0 hidden md:block">
        <div className="flex items-center justify-end">
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            <MdShoppingCart className="w-5 h-5" />
            View All Orders
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-2 pb-20 md:pb-4">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
          {/* Total Orders */}
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <MdShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-500">
                  Total Orders
                </p>
                <p className="text-lg md:text-2xl font-bold text-slate-900">
                  {metrics?.total_orders || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Paid in Full */}
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <MdCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-500">
                  Paid in Full
                </p>
                <p className="text-lg md:text-2xl font-bold text-emerald-600">
                  {metrics?.total_paid_in_full || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Payment */}
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <MdPendingActions className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-500">Pending</p>
                <p className="text-lg md:text-2xl font-bold text-amber-600">
                  {metrics?.total_pending_payment || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Partially Paid */}
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <MdPayment className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-500">Partial</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">
                  {metrics?.total_partially_paid || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
              <MdReceipt className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              Recent Orders
            </h2>
            <span className="text-xs md:text-sm text-gray-500">
              {recentOrders.length} orders
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 md:p-8 text-center">
              <MdShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm md:text-base">
                No orders found
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden p-3 pb-20 space-y-2">
                {recentOrders.map((order: DistributorDashboardOrder) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-bold text-primary text-sm">
                          {order.order_number}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">
                          {formatPrice(order.amount)}
                        </p>
                      </div>
                    </div>
                    {/* Row 1: Payment, Items with labels */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div>
                        <span className="text-gray-400 text-[10px]">
                          Payment
                        </span>
                        <p>{getPaymentStatusBadge(order.payment_status)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">Items</span>
                        <p className="text-gray-900 font-medium">
                          {order.items_count}
                        </p>
                      </div>
                    </div>
                    {/* Row 2: Date and Delivery with labels */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px]">Date</span>
                        <p className="text-gray-600">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">
                          Delivery
                        </span>
                        <p>{getDeliveryStatusBadge(order.delivery_status)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                        Order #
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                        Items
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                        Paid
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                        Payment
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                        Delivery
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order: DistributorDashboardOrder) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-medium text-primary hover:underline text-sm"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateTime(order.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {order.items_count} item
                            {order.items_count !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-gray-900 text-sm">
                            {formatPrice(order.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-600">
                            {formatPrice(order.amount_paid)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getPaymentStatusBadge(order.payment_status)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getDeliveryStatusBadge(order.delivery_status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
