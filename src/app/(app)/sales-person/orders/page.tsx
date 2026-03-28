"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdAdd,
  MdShoppingCart,
  MdVisibility,
  MdMoreVert,
  MdFilterList,
  MdPerson,
  MdPayment,
  MdLocalShipping,
  MdClose,
  MdPictureAsPdf,
} from "react-icons/md";
import {
  useSalesPersonPortalOrders,
  useInitiateOrderPayment,
  usePaymentStatus,
} from "@/hooks/useSalesPersonPortal";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import OrderReportModal from "@/components/common/OrderReportModal";
import OrdersReportPDF from "@/components/common/OrdersReportPDF";
import { SalesPersonOrder } from "@/types/salesPersonOrder";
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

export default function SalesPersonOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesPersonOrder | null>(
    null,
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [pollingOrderId, setPollingOrderId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showOrderReportModal, setShowOrderReportModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const deliveryDropdownRef = useRef<HTMLDivElement>(null);
  const perPage = 15;

  const { user } = useAuth();

  const initiatePaymentMutation = useInitiateOrderPayment();

  // Payment status polling
  const { data: paymentStatusData } = usePaymentStatus(
    pollingOrderId,
    isPolling,
  );

  // Handle payment status changes
  useEffect(() => {
    if (!paymentStatusData || !isPolling) return;

    const status = paymentStatusData.data?.payment_status;

    if (status === "paid") {
      toast.success("Payment completed successfully!");
      setIsPolling(false);
      setPollingOrderId(null);
      setShowPayModal(false);
      // Redirect to order detail page
      if (selectedOrder) {
        router.push(`/sales-person/orders/${selectedOrder.id}`);
      }
    } else if (status === "failed" || status === "cancelled") {
      const reason =
        paymentStatusData.data?.failure_reason || paymentStatusData.message;
      toast.error(reason || `Payment ${status}. Please try again.`);
      setIsPolling(false);
      setPollingOrderId(null);
    }
  }, [paymentStatusData, isPolling, selectedOrder, router]);

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

  const { data, isLoading, error } = useSalesPersonPortalOrders({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    payment_status: paymentFilter || undefined,
    delivery_status: deliveryFilter || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  const calculateBalance = (amount: string, amountPaid: string) => {
    const total = parseFloat(amount);
    const paid = parseFloat(amountPaid);
    return total - paid;
  };

  const handleOpenPayModal = (order: SalesPersonOrder) => {
    setSelectedOrder(order);
    // Pre-fill with 254 country code
    setPhoneNumber("254");
    // Default amount to balance due
    const balance = calculateBalance(order.amount, order.amount_paid);
    setPaymentAmount(balance.toFixed(2));
    setShowPayModal(true);
  };

  const handleClosePayModal = () => {
    // Only close if not polling
    if (isPolling) {
      toast.error("Please wait for payment to complete or cancel");
      return;
    }
    setShowPayModal(false);
    setSelectedOrder(null);
    setPhoneNumber("");
    setPaymentAmount("");
    setPollingOrderId(null);
    setIsPolling(false);
  };

  const handleInitiatePayment = () => {
    if (!selectedOrder || !phoneNumber.trim() || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    initiatePaymentMutation.mutate(
      {
        orderId: selectedOrder.id.toString(),
        data: { phone_number: phoneNumber.trim(), amount },
      },
      {
        onSuccess: () => {
          // Delay polling to allow backend to create transaction record
          setTimeout(() => {
            setPollingOrderId(selectedOrder.id.toString());
            setIsPolling(true);
          }, 2000);
        },
      },
    );
  };

  const handleCancelPolling = () => {
    setIsPolling(false);
    setPollingOrderId(null);
    toast("Payment polling cancelled. You can try again.");
  };

  const handleDownloadOrderPdf = useCallback(
    async (reportParams: {
      filter: string;
      paymentStatus: string;
      deliveryStatus: string;
      dateFrom: string;
      dateTo: string;
    }) => {
      setIsGeneratingPdf(true);
      try {
        const { getSalesPersonPortalOrders } =
          await import("@/services/salesPersonPortalService");

        const isUnpaidBalances = reportParams.filter === "dispatched_unpaid";
        const isOverdue = reportParams.filter === "dispatched_overdue";

        // Build payment_status: explicit filter dropdown takes priority, then report type
        const paymentStatusParam =
          reportParams.paymentStatus ||
          (reportParams.filter === "paid" ? "paid" : undefined);

        // Build delivery_status: explicit filter dropdown takes priority, then report type
        const deliveryStatusParam =
          reportParams.deliveryStatus ||
          (reportParams.filter === "dispatched" || isUnpaidBalances || isOverdue
            ? "dispatched"
            : undefined);

        const reportData = await getSalesPersonPortalOrders({
          paginate: false,
          payment_status: paymentStatusParam,
          delivery_status: deliveryStatusParam,
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

        let filteredSource = reportData.data;

        // Filter for unpaid balances
        if (isUnpaidBalances) {
          filteredSource = filteredSource.filter((o: SalesPersonOrder) => {
            const amt = parseFloat(String(o.amount)) || 0;
            const paid = parseFloat(String(o.amount_paid)) || 0;
            return amt - paid > 0 && o.payment_status !== "paid";
          });
        }

        // Filter for overdue (dispatched > 7 days with balance)
        if (isOverdue) {
          const now = new Date();
          filteredSource = filteredSource.filter((o: SalesPersonOrder) => {
            const amt = parseFloat(String(o.amount)) || 0;
            const paid = parseFloat(String(o.amount_paid)) || 0;
            const createdDate = new Date(o.created_at);
            const daysDiff = Math.floor(
              (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
            );
            return (
              amt - paid > 0 && o.payment_status !== "paid" && daysDiff > 7
            );
          });
        }

        if (!filteredSource.length) {
          toast.error(
            `No ${isUnpaidBalances ? "unpaid balance" : isOverdue ? "overdue" : "order"} data to generate report`,
          );
          return;
        }

        const reportOrders = filteredSource.map((o: SalesPersonOrder) => {
          const amt = parseFloat(String(o.amount)) || 0;
          const paid = parseFloat(String(o.amount_paid)) || 0;
          return {
            id: o.id,
            order_number: o.order_number,
            customer_name: o.customer?.name || "N/A",
            items_count: o.items_count,
            amount: amt.toLocaleString("en-KE", { minimumFractionDigits: 2 }),
            amount_paid: paid.toLocaleString("en-KE", {
              minimumFractionDigits: 2,
            }),
            balance: (amt - paid).toLocaleString("en-KE", {
              minimumFractionDigits: 2,
            }),
            payment_status: o.payment_status,
            delivery_status: o.delivery_status,
            date: formatDate(o.created_at),
          };
        });

        // Filter by date range client-side since SP service doesn't support date params
        let filtered = reportOrders;
        if (reportParams.dateFrom) {
          filtered = filtered.filter(
            (o) => new Date(o.date) >= new Date(reportParams.dateFrom),
          );
        }
        if (reportParams.dateTo) {
          filtered = filtered.filter(
            (o) => new Date(o.date) <= new Date(reportParams.dateTo),
          );
        }

        const totalAmount = filteredSource.reduce(
          (s, o) => s + (parseFloat(String(o.amount)) || 0),
          0,
        );
        const totalPaid = filteredSource.reduce(
          (s, o) => s + (parseFloat(String(o.amount_paid)) || 0),
          0,
        );
        const totalBalance = totalAmount - totalPaid;

        const reportSummary = {
          total_orders: filtered.length,
          total_amount: totalAmount.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
          }),
          total_paid: totalPaid.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
          }),
          total_balance: totalBalance.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
          }),
          paid_count: filteredSource.filter((o) => o.payment_status === "paid")
            .length,
          pending_count: filteredSource.filter(
            (o) =>
              o.payment_status === "pending" ||
              o.payment_status === "partially_paid",
          ).length,
          dispatched_count: filteredSource.filter(
            (o) => o.delivery_status === "dispatched",
          ).length,
          delivered_count: filteredSource.filter(
            (o) => o.delivery_status === "delivered",
          ).length,
        };

        const FILTER_LABELS: Record<string, string> = {
          paid: "Paid Orders",
          dispatched: "Dispatched Orders",
          dispatched_unpaid: "Dispatched Unpaid Balances",
          dispatched_overdue: "Dispatched Overdue Orders",
        };

        // Build report label from filter + status selections
        const parts: string[] = [];
        if (reportParams.filter) {
          parts.push(FILTER_LABELS[reportParams.filter] || "Orders");
        }
        if (reportParams.paymentStatus) {
          parts.push(
            `${reportParams.paymentStatus.charAt(0).toUpperCase() + reportParams.paymentStatus.slice(1)} Payment`,
          );
        }
        if (reportParams.deliveryStatus) {
          parts.push(
            `${reportParams.deliveryStatus.charAt(0).toUpperCase() + reportParams.deliveryStatus.slice(1)} Delivery`,
          );
        }
        const filterLabel = parts.length > 0 ? parts.join(" — ") : "Orders";

        const blob = await pdf(
          <OrdersReportPDF
            orders={filtered}
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
        link.download = `sp-orders-report-${reportParams.filter || "all"}-${dateStr}.pdf`;
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
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-2 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
              <MdShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Orders
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                {data?.pagination?.total || 0} orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Search orders..."
              />
            </div>
            <button
              onClick={() => setShowOrderReportModal(true)}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 bg-accent text-white rounded-lg text-xs md:text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdPictureAsPdf className="w-4 h-4" />
              <span className="hidden md:inline">Report</span>
            </button>
            <Link
              href="/sales-person/products"
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-xs md:text-sm"
            >
              <MdAdd className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">New Order</span>
              <span className="md:hidden">Order</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-3 shrink-0">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search orders..."
            className="w-full"
          />
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

        {/* Orders Table - Desktop / Card View - Mobile */}
        {data && data.data.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto p-3 space-y-2">
              {data.data.map((order) => (
                <div
                  key={order.id}
                  className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  {/* Card Header with Order Link */}
                  <Link
                    href={`/sales-person/orders/${order.id}`}
                    className="block mb-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customer?.name || "-"}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                  </Link>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                    >
                      {formatStatus(order.payment_status)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getDeliveryStatusStyle(order.delivery_status)}`}
                    >
                      {order.delivery_status}
                    </span>
                    {calculateBalance(order.amount, order.amount_paid) > 0 && (
                      <span className="text-[10px] text-amber-600 font-medium">
                        Bal:{" "}
                        {formatCurrency(
                          calculateBalance(order.amount, order.amount_paid),
                        )}
                      </span>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>
                      <span className="text-gray-400">Date:</span>{" "}
                      <span className="font-medium text-gray-700">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </span>
                    <span>
                      <span className="text-gray-400">Items:</span>{" "}
                      <span className="font-medium text-gray-700">
                        {order.items_count}
                      </span>
                    </span>
                  </div>

                  {/* Pay Button for Mobile - Only show if payment is not paid */}
                  {order.payment_status !== "paid" && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenPayModal(order);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <MdPayment className="w-3.5 h-3.5" />
                        Pay Balance
                      </button>
                      <Link
                        href={`/sales-person/orders/${order.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <MdVisibility className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:flex md:flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/sales-person/orders/${order.id}`}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-sm text-gray-900">
                              {order.customer?.name || "-"}
                            </span>
                            {order.customer?.phone && (
                              <p className="text-xs text-gray-500">
                                {order.customer.phone}
                              </p>
                            )}
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
                            {calculateBalance(order.amount, order.amount_paid) >
                              0 && (
                              <p className="text-xs text-amber-600">
                                Bal:{" "}
                                {formatCurrency(
                                  calculateBalance(
                                    order.amount,
                                    order.amount_paid,
                                  ),
                                )}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                          >
                            {formatStatus(order.payment_status)}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                          <div className="flex items-center justify-end gap-2">
                            {order.payment_status !== "paid" && (
                              <button
                                onClick={() => handleOpenPayModal(order)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                <MdPayment className="w-4 h-4" />
                                Pay
                              </button>
                            )}
                            <ActionMenu menuId={`order-menu-${order.id}`}>
                              <ActionMenu.Trigger>
                                <MdMoreVert className="w-5 h-5 text-gray-600" />
                              </ActionMenu.Trigger>
                              <ActionMenu.Content>
                                <ActionMenu.Item
                                  onClick={() =>
                                    (window.location.href = `/sales-person/orders/${order.id}`)
                                  }
                                >
                                  <MdVisibility className="w-4 h-4" />
                                  View Details
                                </ActionMenu.Item>
                              </ActionMenu.Content>
                            </ActionMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {data.pagination && data.pagination.total > 0 && (
              <Pagination
                currentPage={data.pagination.current_page}
                totalPages={data.pagination.last_page}
                onPageChange={handlePageChange}
                totalItems={data.pagination.total}
                itemsPerPage={data.pagination.per_page}
              />
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
            <p className="text-gray-600 mb-4">
              {debouncedSearch || paymentFilter || deliveryFilter
                ? "Try adjusting your filters"
                : "Get started by creating your first order."}
            </p>
            <Link
              href="/sales-person/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Order
            </Link>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Initiate M-Pesa Payment
                </h2>
                <p className="text-sm text-gray-500">
                  Order: {selectedOrder.order_number}
                </p>
              </div>
              <button
                onClick={handleClosePayModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-medium text-gray-900">
                    {selectedOrder.customer?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Amount</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedOrder.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(selectedOrder.amount_paid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-700 font-medium">Balance Due</span>
                  <span className="font-bold text-amber-600">
                    {formatCurrency(
                      calculateBalance(
                        selectedOrder.amount,
                        selectedOrder.amount_paid,
                      ),
                    )}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label
                  htmlFor="paymentAmount"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Amount to Pay (KES)
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  value={paymentAmount}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg outline-none bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Amount is set to the balance due
                </p>
              </div>

              {/* Phone Number Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254700000000"
                  disabled={isPolling}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the phone number that will receive the M-Pesa STK push
                </p>
              </div>

              {/* Polling Status */}
              {isPolling && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="animate-spin w-5 h-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Waiting for payment confirmation...
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Please check your phone and enter your M-Pesa PIN
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              {isPolling ? (
                <button
                  onClick={handleCancelPolling}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Payment
                </button>
              ) : (
                <>
                  <button
                    onClick={handleClosePayModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInitiatePayment}
                    disabled={
                      !phoneNumber.trim() ||
                      !paymentAmount ||
                      parseFloat(paymentAmount) <= 0 ||
                      initiatePaymentMutation.isPending
                    }
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {initiatePaymentMutation.isPending ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MdPayment className="w-4 h-4" />
                        Send Payment Request
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
