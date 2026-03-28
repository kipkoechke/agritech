"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MdPayment,
  MdFilterList,
  MdReceipt,
  MdPhoneAndroid,
  MdAccountBalanceWallet,
  MdShoppingCart,
  MdCreditScore,
  MdPictureAsPdf,
} from "react-icons/md";
import { useDepotPayments } from "@/hooks/useDepotPortal";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/components/common/Pagination";
import StatCard from "@/components/common/StatCard";
import { SearchField } from "@/components/common/SearchField";
import PaymentsReportPDF from "@/components/common/PaymentsReportPDF";
import ReportModal from "@/components/common/ReportModal";
import { pdf } from "@react-pdf/renderer";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils/formatCurrency";

const PURPOSE_STYLES: Record<string, string> = {
  order_payment: "bg-blue-50 text-blue-700 border-blue-200",
  wallet_credit: "bg-green-50 text-green-700 border-green-200",
};

const PURPOSE_LABELS: Record<string, string> = {
  order_payment: "Order Payment",
  wallet_credit: "Wallet Top Up",
};

const PURPOSE_OPTIONS = [
  { value: "", label: "All Purposes" },
  { value: "order_payment", label: "Order Payment" },
  { value: "wallet_credit", label: "Wallet Top Up" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "wallet", label: "Wallet" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "failed":
      return "bg-red-50 text-red-700 border-red-200";
    case "refunded":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getMethodIcon = (method: string) => {
  switch (method) {
    case "mpesa":
      return <MdPhoneAndroid className="w-4 h-4 text-green-600" />;
    case "wallet":
      return <MdAccountBalanceWallet className="w-4 h-4 text-blue-600" />;
    default:
      return <MdPayment className="w-4 h-4 text-gray-600" />;
  }
};

const inferPurpose = (payment: { order?: { order_number?: string } | null }) =>
  payment.order?.order_number ? "order_payment" : "wallet_credit";

export default function DepotPaymentsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const purposeDropdownRef = useRef<HTMLDivElement | null>(null);
  const methodDropdownRef = useRef<HTMLDivElement | null>(null);
  const perPage = 15;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        purposeDropdownRef.current &&
        !purposeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPurposeDropdown(false);
      }
      if (
        methodDropdownRef.current &&
        !methodDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMethodDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isLoading, error } = useDepotPayments({
    page,
    per_page: perPage,
    search: search || undefined,
    payment_method: methodFilter || undefined,
  });

  // Fetch ALL payments for stat cards and PDF (no pagination)
  const { data: allData } = useDepotPayments({
    paginate: false,
    payment_method: methodFilter || undefined,
  });

  const handleDownloadPdf = useCallback(
    async (reportParams: {
      purpose: string;
      dateFrom: string;
      dateTo: string;
    }) => {
      setIsGeneratingPdf(true);
      try {
        const { getDepotPayments } =
          await import("@/services/depotPortalService");
        const reportData = await getDepotPayments({
          paginate: false,
          date_from: reportParams.dateFrom || undefined,
          date_to: reportParams.dateTo || undefined,
        });

        if (!reportData?.data?.length) {
          toast.error("No payment data to generate report");
          return;
        }

        // Filter by purpose if specified
        const filteredData = reportParams.purpose
          ? reportData.data.filter((p) => {
              const inferredPurpose = p.order?.order_number
                ? "order_payment"
                : "wallet_credit";
              return inferredPurpose === reportParams.purpose;
            })
          : reportData.data;

        if (!filteredData.length) {
          toast.error("No payment data matching the selected filters");
          return;
        }

        const reportPayments = filteredData.map((p) => ({
          id: String(p.id),
          transaction_id: p.transaction_number,
          customer_name: p.customer?.name || "-",
          purpose: p.order?.order_number ? "order_payment" : "wallet_credit",
          payment_method: p.payment_method,
          amount: String(p.amount),
          status: p.status,
          date: new Date(p.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          receipt_number: p.order?.order_number || undefined,
        }));

        const totalAmount = filteredData.reduce(
          (sum, p) => sum + (parseFloat(String(p.amount)) || 0),
          0,
        );

        const reportSummary = {
          total_transactions: reportPayments.length,
          total_amount: totalAmount.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
          }),
          order_payments_amount: "0.00",
          order_payments_count: 0,
          prepayments_amount: "0.00",
          prepayments_count: 0,
          order_payments_total_order_value: "0.00",
        };

        const purposeLabel =
          reportParams.purpose === "order_payment"
            ? "Order Payments"
            : reportParams.purpose === "wallet_credit"
              ? "Wallet Top Ups"
              : "Payments";

        const blob = await pdf(
          <PaymentsReportPDF
            payments={reportPayments}
            summary={reportSummary}
            dateRange={{ from: reportParams.dateFrom, to: reportParams.dateTo }}
            generatedBy={user?.name}
            reportType={`Depot ${purposeLabel} Report`}
          />,
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateStr = new Date().toISOString().split("T")[0];
        link.download = `depot-payments-report-${dateStr}.pdf`;
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
    [allData, user?.name],
  );

  // Compute summary stats from allData
  const allPayments = allData?.data || [];
  const orderPayments = allPayments.filter(
    (p) => inferPurpose(p) === "order_payment",
  );
  const walletPayments = allPayments.filter(
    (p) => inferPurpose(p) === "wallet_credit",
  );
  const totalReceivedAmount = allPayments
    .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0)
    .toLocaleString("en-KE", { minimumFractionDigits: 2 });
  const orderPaymentsAmount = orderPayments
    .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0)
    .toLocaleString("en-KE", { minimumFractionDigits: 2 });
  const walletTopUpsAmount = walletPayments
    .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0)
    .toLocaleString("en-KE", { minimumFractionDigits: 2 });

  const payments = data?.data || [];
  const pagination = data?.pagination;

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load payments</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-3 md:px-4 py-2 pb-20 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
              <MdPayment className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Transactions
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                {pagination?.total || 0} total transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <SearchField
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search by transaction ID, name..."
              className="w-full md:w-72"
            />

            {/* Generate Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdPictureAsPdf className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {allPayments.length > 0 && (
          <div className="mb-3 shrink-0">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <StatCard
                title="Total Received Amount"
                mainValue={`KES ${totalReceivedAmount}`}
                subtitle={`${allPayments.length} transactions`}
              >
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MdShoppingCart className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600" />
                </div>
              </StatCard>

              <StatCard
                title="Order Payments"
                mainValue={`KES ${orderPaymentsAmount}`}
                subtitle={`${orderPayments.length} transactions`}
              >
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <MdReceipt className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
                </div>
              </StatCard>

              <StatCard
                title="Wallet Top Ups"
                mainValue={`KES ${walletTopUpsAmount}`}
                subtitle={`${walletPayments.length} transactions`}
              >
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <MdCreditScore className="w-3.5 h-3.5 md:w-5 md:h-5 text-amber-600" />
                </div>
              </StatCard>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">No payments found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {payment.transaction_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.order?.order_number || "-"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${PURPOSE_STYLES[inferPurpose(payment)] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                      >
                        {PURPOSE_LABELS[inferPurpose(payment)] ||
                          inferPurpose(payment)}
                      </span>
                    </div>
                    {/* Row 1: Customer, Amount */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div>
                        <span className="text-gray-400 text-[10px]">
                          Customer
                        </span>
                        <p className="text-gray-900">
                          {payment.customer?.name || "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">
                          Amount
                        </span>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                    {/* Row 2: Method, Date */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px]">
                          Source
                        </span>
                        <p className="text-gray-600 flex items-center gap-1">
                          {getMethodIcon(payment.payment_method)}
                          {payment.payment_method === "mpesa"
                            ? "M-Pesa"
                            : payment.payment_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">Date</span>
                        <p className="text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Transaction</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">
                        <div
                          className="relative inline-block"
                          ref={purposeDropdownRef}
                        >
                          <button
                            onClick={() =>
                              setShowPurposeDropdown(!showPurposeDropdown)
                            }
                            className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                              purpose ? "text-accent" : ""
                            }`}
                          >
                            Purpose
                            <MdFilterList
                              className={`w-4 h-4 ${purpose ? "text-accent" : ""}`}
                            />
                          </button>
                          {showPurposeDropdown && (
                            <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              {PURPOSE_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setPurpose(option.value);
                                    setShowPurposeDropdown(false);
                                    setPage(1);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                    purpose === option.value
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
                      <th className="px-4 py-3">
                        <div
                          className="relative inline-block"
                          ref={methodDropdownRef}
                        >
                          <button
                            onClick={() =>
                              setShowMethodDropdown(!showMethodDropdown)
                            }
                            className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                              methodFilter ? "text-accent" : ""
                            }`}
                          >
                            Source
                            <MdFilterList
                              className={`w-4 h-4 ${methodFilter ? "text-accent" : ""}`}
                            />
                          </button>
                          {showMethodDropdown && (
                            <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              {PAYMENT_METHOD_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setMethodFilter(option.value);
                                    setShowMethodDropdown(false);
                                    setPage(1);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                    methodFilter === option.value
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
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments
                      .filter((p) => !purpose || inferPurpose(p) === purpose)
                      .map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {payment.transaction_number}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.order?.order_number || "-"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-gray-900">
                                {payment.customer?.name || "-"}
                              </p>
                              {payment.customer?.email && (
                                <p className="text-xs text-gray-500">
                                  {payment.customer.email}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
                                PURPOSE_STYLES[inferPurpose(payment)] ||
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              {PURPOSE_LABELS[inferPurpose(payment)] ||
                                inferPurpose(payment)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.payment_method)}
                              <span className="text-sm text-gray-600 capitalize">
                                {payment.payment_method === "mpesa"
                                  ? "M-Pesa"
                                  : payment.payment_method}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${getStatusStyle(payment.status)}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600">
                              {new Date(payment.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              totalItems={pagination.total}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={handleDownloadPdf}
        isGenerating={isGeneratingPdf}
        title="Generate Transactions Report"
      />
    </div>
  );
}
