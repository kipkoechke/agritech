"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdShoppingCart,
  MdPerson,
  MdFilterList,
  MdPayment,
  MdLocalShipping,
  MdSend,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCalendarToday,
  MdPictureAsPdf,
} from "react-icons/md";
import { useDepotOrders } from "@/hooks/useDepotPortal";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import Button from "@/components/common/Button";
import OrderReportModal from "@/components/common/OrderReportModal";
import OrdersReportPDF from "@/components/common/OrdersReportPDF";
import type { DepotPortalOrder } from "@/types/depotPortal";
import { pdf } from "@react-pdf/renderer";
import { formatCurrency } from "@/utils/formatCurrency";
import toast from "react-hot-toast";

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Payment Status" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

const DELIVERY_STATUS_OPTIONS = [
  { value: "", label: "All Delivery Status" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800";
    case "partially_paid":
      return "bg-amber-100 text-amber-800";
    case "pending":
      return "bg-slate-100 text-slate-800";
    case "refunded":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getDeliveryStatusStyle = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "dispatched":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "pending":
      return "bg-slate-100 text-slate-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DepotOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const deliveryDropdownRef = useRef<HTMLDivElement>(null);
  const perPage = 15;

  // Dispatch state
  const [selectedOrders, setSelectedOrders] = useState<DepotPortalOrder[]>([]);
  const [showOrderReportModal, setShowOrderReportModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        paymentDropdownRef.current &&
        !paymentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPaymentDropdown(false);
      }
      if (
        deliveryDropdownRef.current &&
        !deliveryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDeliveryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useDepotOrders({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    payment_status: paymentFilter || undefined,
    delivery_status: deliveryFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Get dispatchable orders (paid or credit orders, and not yet dispatched/delivered)
  const dispatchableOrders =
    data?.data?.filter(
      (order) =>
        (order.payment_status === "paid" || order.is_credit_order) &&
        (order.delivery_status === "pending" ||
          order.delivery_status === "processing"),
    ) || [];

  const toggleOrderSelection = (order: DepotPortalOrder) => {
    setSelectedOrders((prev) => {
      const isSelected = prev.some((o) => o.id === order.id);
      if (isSelected) {
        return prev.filter((o) => o.id !== order.id);
      }
      return [...prev, order];
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === dispatchableOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(dispatchableOrders);
    }
  };

  const isOrderSelected = (orderId: string) =>
    selectedOrders.some((o) => o.id === orderId);

  const goToDispatchReview = () => {
    if (selectedOrders.length === 0) return;
    sessionStorage.setItem(
      "dispatch-order-ids",
      JSON.stringify(selectedOrders.map((o) => o.id)),
    );
    router.push("/depot/orders/dispatch-review");
  };

  const handleDownloadOrderPdf = useCallback(
    async (reportParams: { filter: string; paymentStatus: string; deliveryStatus: string; dateFrom: string; dateTo: string }) => {
      setIsGeneratingPdf(true);
      try {
        const { getDepotOrders } = await import("@/services/depotPortalService");

        // Build payment_status: explicit filter dropdown takes priority, then report type
        const paymentStatusParam =
          reportParams.paymentStatus ||
          (reportParams.filter === "paid" ? "paid" : undefined);

        // Build delivery_status: explicit filter dropdown takes priority, then report type
        const deliveryStatusParam =
          reportParams.deliveryStatus ||
          (reportParams.filter === "dispatched" ? "dispatched" : undefined);

        const reportData = await getDepotOrders({
          paginate: false,
          payment_status: paymentStatusParam,
          delivery_status: deliveryStatusParam,
          date_from: reportParams.dateFrom || undefined,
          date_to: reportParams.dateTo || undefined,
        });

        if (!reportData?.data?.length) {
          toast.error("No order data to generate report");
          return;
        }

        const formatDate = (d: string) =>
          new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

        const reportOrders = reportData.data.map((o: DepotPortalOrder) => ({
          id: o.id,
          order_number: o.order_number,
          customer_name: o.customer?.name || "N/A",
          items_count: o.items_count,
          amount: formatCurrency(o.amount),
          amount_paid: formatCurrency(o.amount_paid),
          balance: formatCurrency(o.balance_remaining),
          payment_status: o.payment_status,
          delivery_status: o.delivery_status,
          date: formatDate(o.created_at),
        }));

        const totalAmount = reportData.data.reduce((s, o) => s + (parseFloat(String(o.amount)) || 0), 0);
        const totalPaid = reportData.data.reduce((s, o) => s + (parseFloat(String(o.amount_paid)) || 0), 0);
        const totalBalance = totalAmount - totalPaid;

        const reportSummary = {
          total_orders: reportData.pagination?.total || reportOrders.length,
          total_amount: totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 }),
          total_paid: totalPaid.toLocaleString("en-KE", { minimumFractionDigits: 2 }),
          total_balance: totalBalance.toLocaleString("en-KE", { minimumFractionDigits: 2 }),
          paid_count: reportData.data.filter((o) => o.payment_status === "paid").length,
          pending_count: reportData.data.filter((o) => o.payment_status === "pending" || o.payment_status === "partially_paid").length,
          dispatched_count: reportData.data.filter((o) => o.delivery_status === "dispatched").length,
          delivered_count: reportData.data.filter((o) => o.delivery_status === "delivered").length,
        };

        // Build report label from filter + status selections
        const parts: string[] = [];
        if (reportParams.filter === "paid") parts.push("Paid Orders");
        else if (reportParams.filter === "dispatched") parts.push("Dispatched Orders");
        if (reportParams.paymentStatus) {
          parts.push(`${reportParams.paymentStatus.charAt(0).toUpperCase() + reportParams.paymentStatus.slice(1)} Payment`);
        }
        if (reportParams.deliveryStatus) {
          parts.push(`${reportParams.deliveryStatus.charAt(0).toUpperCase() + reportParams.deliveryStatus.slice(1)} Delivery`);
        }
        const filterLabel = parts.length > 0 ? parts.join(" — ") : "Depot Orders";

        const blob = await pdf(
          <OrdersReportPDF
            orders={reportOrders}
            summary={reportSummary}
            dateRange={{ from: reportParams.dateFrom, to: reportParams.dateTo }}
            generatedBy={user?.name}
            reportType={`${filterLabel} Report`}
          />,
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateStr = new Date().toISOString().split("T")[0];
        link.download = `depot-orders-report-${dateStr}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded successfully");
        setShowOrderReportModal(false);
      } catch {
        toast.error("Failed to generate report");
      } finally {
        setIsGeneratingPdf(false);
      }
    },
    [user?.name],
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Orders
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                View orders in your depot
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search orders..."
            />
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MdCalendarToday className="w-3.5 h-3.5 shrink-0" />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
                className="text-xs text-primary hover:underline"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowOrderReportModal(true)}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdPictureAsPdf className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
            {selectedOrders.length > 0 && (
              <Button
                onClick={goToDispatchReview}
                className="flex items-center gap-1 md:gap-2 text-sm"
              >
                <MdSend className="w-4 h-4" />
                <span className="hidden sm:inline">Dispatch</span> (
                {selectedOrders.length})
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load orders</p>
          </div>
        )}

        {/* Table */}
        {data && data.data.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3">
              {data.data.map((order) => {
                const isDispatchable =
                  (order.payment_status === "paid" || order.is_credit_order) &&
                  (order.delivery_status === "pending" ||
                    order.delivery_status === "processing");
                const isSelected = isOrderSelected(order.id);

                return (
                  <div
                    key={order.id}
                    className={`rounded-lg p-3 border ${isSelected ? "bg-primary/10 border-primary" : isDispatchable ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isDispatchable && (
                          <button
                            onClick={() => toggleOrderSelection(order)}
                            className="text-gray-400 hover:text-primary transition-colors"
                          >
                            {isSelected ? (
                              <MdCheckBox className="w-5 h-5 text-primary" />
                            ) : (
                              <MdCheckBoxOutlineBlank className="w-5 h-5" />
                            )}
                          </button>
                        )}
                        <Link
                          href={`/depot/orders/${order.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {order.customer?.name || "-"}
                    </div>
                    {/* Row 1: Amount, Payment, Items with labels */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div>
                        <span className="text-gray-400 text-[10px]">Amount</span>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(order.amount)}
                        </p>
                        {parseFloat(String(order.balance_remaining)) > 0 && (
                          <p className="text-amber-600 text-[10px]">
                            Bal: {formatCurrency(order.balance_remaining)}
                          </p>
                        )}
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-[10px]">Payment</span>
                        <p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                          >
                            {order.payment_status.replace("_", " ")}
                          </span>
                        </p>
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
                          {new Date(order.created_at).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-gray-400 text-[10px]">Delivery</span>
                          <p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDeliveryStatusStyle(order.delivery_status)}`}
                            >
                              {order.delivery_status}
                            </span>
                          </p>
                        </div>
                        <Link
                          href={`/depot/orders/${order.id}`}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <div className="flex items-center gap-1">
                        {dispatchableOrders.length > 0 && (
                          <button
                            onClick={toggleSelectAll}
                            className="text-gray-400 font-bold hover:text-primary transition-colors"
                            title={
                              selectedOrders.length ===
                              dispatchableOrders.length
                                ? "Deselect all"
                                : "Select all dispatchable"
                            }
                          >
                            {selectedOrders.length ===
                              dispatchableOrders.length &&
                            dispatchableOrders.length > 0 ? (
                              <MdCheckBox className="w-4 h-4 text-primary" />
                            ) : (
                              <MdCheckBoxOutlineBlank className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        Dispatch
                      </div>
                    </th>
                    <th className="pr-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MdPerson className="w-3.5 h-3.5" />
                        Customer
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div
                        className="relative inline-block"
                        ref={paymentDropdownRef}
                      >
                        <button
                          onClick={() =>
                            setShowPaymentDropdown(!showPaymentDropdown)
                          }
                          className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                            paymentFilter ? "text-accent" : ""
                          }`}
                        >
                          <MdPayment className="w-3.5 h-3.5" />
                          Payment
                          <MdFilterList
                            className={`w-4 h-4 ${paymentFilter ? "text-accent" : ""}`}
                          />
                        </button>
                        {showPaymentDropdown && (
                          <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            {PAYMENT_STATUS_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setPaymentFilter(option.value);
                                  setShowPaymentDropdown(false);
                                  setPage(1);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                  paymentFilter === option.value
                                    ? "bg-accent/10 text-accent font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div
                        className="relative inline-block"
                        ref={deliveryDropdownRef}
                      >
                        <button
                          onClick={() =>
                            setShowDeliveryDropdown(!showDeliveryDropdown)
                          }
                          className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                            deliveryFilter ? "text-accent" : ""
                          }`}
                        >
                          <MdLocalShipping className="w-3.5 h-3.5" />
                          Delivery
                          <MdFilterList
                            className={`w-4 h-4 ${deliveryFilter ? "text-accent" : ""}`}
                          />
                        </button>
                        {showDeliveryDropdown && (
                          <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            {DELIVERY_STATUS_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setDeliveryFilter(option.value);
                                  setShowDeliveryDropdown(false);
                                  setPage(1);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                  deliveryFilter === option.value
                                    ? "bg-accent/10 text-accent font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((order) => {
                    const isDispatchable =
                      (order.payment_status === "paid" ||
                        order.is_credit_order) &&
                      (order.delivery_status === "pending" ||
                        order.delivery_status === "processing");
                    const isSelected = isOrderSelected(order.id);

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 ${
                          isSelected
                            ? "bg-primary/25"
                            : isDispatchable
                              ? "bg-amber-100/50"
                              : ""
                        }`}
                      >
                        <td className="px-2 py-4 whitespace-nowrap w-12">
                          {isDispatchable ? (
                            <button
                              onClick={() => toggleOrderSelection(order)}
                              className="text-gray-400 hover:text-primary transition-colors"
                            >
                              {isSelected ? (
                                <MdCheckBox className="w-5 h-5 text-primary" />
                              ) : (
                                <MdCheckBoxOutlineBlank className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <span className="w-5 h-5 block" />
                          )}
                        </td>
                        <td className="pr-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/depot/orders/${order.id}`}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-gray-900">
                              {order.customer?.name || "-"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.customer?.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {order.items_count} item
                            {order.items_count !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(order.amount)}
                            </p>
                            {parseFloat(String(order.balance_remaining)) > 0 && (
                              <p className="text-xs text-amber-600">
                                Bal: {formatCurrency(order.balance_remaining)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                          >
                            {order.payment_status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDeliveryStatusStyle(order.delivery_status)}`}
                          >
                            {order.delivery_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data.pagination && data.pagination.total > 0 && (
              <div className="px-3 md:px-0 py-3 border-t border-gray-200 bg-white shrink-0">
                <Pagination
                  currentPage={data.pagination.current_page}
                  totalPages={data.pagination.last_page}
                  onPageChange={handlePageChange}
                  totalItems={data.pagination.total}
                  itemsPerPage={data.pagination.per_page}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              {debouncedSearch || paymentFilter || deliveryFilter
                ? "Try adjusting your filters"
                : "No orders in your depot yet."}
            </p>
          </div>
        )}
      </div>

      {/* Order Report Modal */}
      <OrderReportModal
        isOpen={showOrderReportModal}
        onClose={() => setShowOrderReportModal(false)}
        onGenerate={handleDownloadOrderPdf}
        isGenerating={isGeneratingPdf}
        title="Generate Orders Report"
      />
    </div>
  );
}
