"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  MdPayment,
  MdShoppingCart,
  MdCreditScore,
  MdPictureAsPdf,
  MdFilterList,
  MdExpandLess,
  MdExpandMore,
} from "react-icons/md";
import { usePayments } from "@/hooks/usePayment";
import { useAuth } from "@/hooks/useAuth";
import { useCustomers } from "@/hooks/useCustomer";
import { useSalesPersons } from "@/hooks/useSalesPerson";
import { useZones } from "@/hooks/useZone";
import Pagination from "@/components/common/Pagination";
import StatCard from "@/components/common/StatCard";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import type { Payment } from "@/types/payment";
import PaymentsReportPDF from "@/components/common/PaymentsReportPDF";
import ReportModal from "@/components/common/ReportModal";
import { pdf } from "@react-pdf/renderer";
import toast from "react-hot-toast";

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

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "wallet", label: "Wallet" },
];

export default function PaymentsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [salesPersonId, setSalesPersonId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [salesPersonSearch, setSalesPersonSearch] = useState("");
  const purposeDropdownRef = useRef<HTMLDivElement | null>(null);
  const sourceDropdownRef = useRef<HTMLDivElement | null>(null);

  const showFilters =
    user?.role === "super-admin" || user?.role === "business-manager";

  const hasAnyFilter = !!(
    paymentMethod ||
    purpose ||
    zoneId ||
    customerId ||
    salesPersonId ||
    startDate ||
    endDate
  );

  const handleClearFilters = () => {
    setPaymentMethod("");
    setPurpose("");
    setZoneId("");
    setCustomerId("");
    setSalesPersonId("");
    setSalesPersonSearch("");
    setCustomerSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        purposeDropdownRef.current &&
        !purposeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPurposeDropdown(false);
      }
      if (
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSourceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Customer options for filter
  const customerParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (zoneId) params.zone_id = zoneId;
    if (salesPersonId) params.sales_person_id = salesPersonId;
    if (customerSearch) params.search = customerSearch;
    return params;
  }, [zoneId, salesPersonId, customerSearch]);

  const { data: customersData, isLoading: customersLoading } =
    useCustomers(customerParams);

  const customerOptions = useMemo(() => {
    return [
      { value: "", label: "All Customers" },
      ...(customersData?.data.map((c) => ({
        value: c.id,
        label: c.name,
      })) || []),
    ];
  }, [customersData]);

  // Sales person options for filter
  const salesPersonParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (zoneId) params.zone_id = zoneId;
    if (salesPersonSearch) params.search = salesPersonSearch;
    return params;
  }, [zoneId, salesPersonSearch]);

  const { data: salesPersonsData, isLoading: salesPersonsLoading } =
    useSalesPersons(salesPersonParams);

  const salesPersonOptions = useMemo(() => {
    return [
      { value: "", label: "All Sales Reps" },
      ...(salesPersonsData?.data.map((person) => ({
        value: person.id,
        label: person.name,
      })) || []),
    ];
  }, [salesPersonsData]);

  // Zone/Depot options for filter
  const { data: zonesData, isLoading: zonesLoading } = useZones({
    per_page: 100,
  });

  const zoneOptions = useMemo(() => {
    return [
      { value: "", label: "All Depots" },
      ...(zonesData?.data.map((zone) => ({
        value: zone.id,
        label: zone.name,
      })) || []),
    ];
  }, [zonesData]);

  const { data, isLoading, error } = usePayments({
    page,
    per_page: 15,
    search: search || undefined,
    payment_method: paymentMethod || undefined,
    purpose: purpose || undefined,
    zone_id: zoneId || undefined,
    customer_id: customerId || undefined,
    sales_person_id: salesPersonId || undefined,
    start_date: startDate || undefined,
    to_date: endDate || undefined,
  });

  const payments = data?.data || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    return `KES ${amount}`;
  };

  const handleDownloadPdf = useCallback(
    async (reportParams: {
      purpose: string;
      dateFrom: string;
      dateTo: string;
    }) => {
      setIsGeneratingPdf(true);
      try {
        // Fetch data with report-specific filters
        const { getPayments } = await import("@/services/paymentService");
        const reportData = await getPayments({
          paginate: false,
          purpose: reportParams.purpose || undefined,
          start_date: reportParams.dateFrom || undefined,
          to_date: reportParams.dateTo || undefined,
        });

        if (!reportData?.data?.length) {
          toast.error("No payment data to generate report");
          return;
        }

        const reportPayments = reportData.data.map((p: Payment) => ({
          id: p.id,
          transaction_id: p.transaction_id,
          customer_name: p.first_name,
          purpose: p.purpose,
          payment_method: p.payment_method,
          amount: p.amount,
          status: p.status,
          date: formatDate(p.transaction_time),
          receipt_number:
            p.mpesa_receipt_number !== "WALLET"
              ? p.mpesa_receipt_number
              : p.wallet_code,
        }));

        const reportSummary = {
          total_transactions:
            reportData.pagination?.total || reportPayments.length,
          total_amount:
            reportData.summary?.order_payments?.total_amount || "0.00",
          order_payments_amount:
            reportData.summary?.order_payments?.total_amount || "0.00",
          order_payments_count:
            reportData.summary?.order_payments?.total_transactions || 0,
          prepayments_amount:
            reportData.summary?.prepayments?.total_amount || "0.00",
          prepayments_count:
            reportData.summary?.prepayments?.total_transactions || 0,
          order_payments_total_order_value:
            reportData.summary?.order_payments?.total_order_value || "0.00",
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
            reportType={`${purposeLabel} Report`}
          />,
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateStr = new Date().toISOString().split("T")[0];
        link.download = `payments-report-${dateStr}.pdf`;
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
    [user?.name],
  );

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

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 mb-2 shrink-0">
            <div
              className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <MdFilterList className="w-4 h-4 md:w-5 md:h-5 text-gray-500 shrink-0" />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  Filters
                  {hasAnyFilter && (
                    <span className="ml-2 text-xs text-blue-600">
                      (Filters applied)
                    </span>
                  )}
                </span>
              </div>
              {isFilterExpanded ? (
                <MdExpandLess className="w-5 h-5 text-gray-500" />
              ) : (
                <MdExpandMore className="w-5 h-5 text-gray-500" />
              )}
            </div>
            {isFilterExpanded && (
              <div className="border-t border-gray-100 px-3 md:px-4 py-3">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2 md:gap-3 items-end">
                  <div>
                    <SearchableSelect
                      label="Depot"
                      options={zoneOptions}
                      value={zoneId}
                      onChange={(val) => {
                        setZoneId(val);
                        setPage(1);
                      }}
                      placeholder="All Depots"
                      disabled={zonesLoading}
                    />
                  </div>
                  <div>
                    <SearchableSelect
                      label="Sales Rep"
                      options={salesPersonOptions}
                      value={salesPersonId}
                      onChange={(val) => {
                        setSalesPersonId(val);
                        setPage(1);
                      }}
                      placeholder="All Sales Reps"
                      disabled={salesPersonsLoading}
                      onSearchChange={setSalesPersonSearch}
                      isLoading={salesPersonsLoading}
                    />
                  </div>
                  <div>
                    <SearchableSelect
                      label="Customer"
                      options={customerOptions}
                      value={customerId}
                      onChange={(val) => {
                        setCustomerId(val);
                        setPage(1);
                      }}
                      placeholder="All Customers"
                      disabled={customersLoading}
                      onSearchChange={setCustomerSearch}
                      isLoading={customersLoading}
                    />
                  </div>
                  <div>
                    <SearchableSelect
                      label="Purpose"
                      options={PURPOSE_OPTIONS}
                      value={purpose}
                      onChange={(val) => {
                        setPurpose(val);
                        setPage(1);
                      }}
                      placeholder="All Purposes"
                    />
                  </div>
                  <div>
                    <SearchableSelect
                      label="Source"
                      options={SOURCE_OPTIONS}
                      value={paymentMethod}
                      onChange={(val) => {
                        setPaymentMethod(val);
                        setPage(1);
                      }}
                      placeholder="All Sources"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-1 flex text-xs font-medium">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
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
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                    />
                  </div>
                  <div>
                    <button
                      onClick={handleClearFilters}
                      disabled={!hasAnyFilter}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
                        hasAnyFilter
                          ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                          : "text-gray-400 bg-gray-50 cursor-not-allowed"
                      }`}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Cards */}
        {summary &&
          (summary.order_payments.total_transactions > 0 ||
            summary.mpesa_payments.total_transactions > 0 ||
            summary.wallet_payments.total_transactions > 0 ||
            summary.prepayments.total_transactions > 0) && (
            <div className="mb-3 shrink-0">
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <StatCard
                  title="Total Received Amount"
                  mainValue={summary.order_payments.total_amount || "0"}
                  subtitle={`${summary.order_payments.total_transactions || 0} transactions`}
                >
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MdShoppingCart className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600" />
                  </div>
                </StatCard>

                <StatCard
                  title="Total Order Value"
                  mainValue={summary.order_payments.total_order_value || "0"}
                  subtitle=""
                >
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <MdPayment className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
                  </div>
                </StatCard>

                <StatCard
                  title="Wallet Top Ups"
                  mainValue={summary.prepayments.total_amount || "0"}
                  subtitle={`${summary.prepayments.total_transactions || 0} transactions`}
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
                {payments.map((payment: Payment) => (
                  <div
                    key={payment.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {payment.transaction_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.mpesa_receipt_number !== "WALLET"
                            ? payment.mpesa_receipt_number
                            : payment.wallet_code}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${PURPOSE_STYLES[payment.purpose] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                      >
                        {PURPOSE_LABELS[payment.purpose] || payment.purpose}
                      </span>
                    </div>
                    {/* Row 1: Customer, Amount */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div>
                        <span className="text-gray-400 text-[10px]">
                          Customer
                        </span>
                        <p className="text-gray-900">{payment.first_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">
                          Amount
                        </span>
                        <p className="font-bold text-gray-900">
                          {formatAmount(payment.amount)}
                        </p>
                      </div>
                    </div>
                    {/* Row 2: Source, Date */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px]">
                          Source
                        </span>
                        <p className="text-gray-600">
                          {payment.payment_method === "mpesa"
                            ? "M-Pesa"
                            : "Wallet"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">Date</span>
                        <p className="text-gray-600">
                          {formatDate(payment.transaction_time)}
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
                          ref={sourceDropdownRef}
                        >
                          <button
                            onClick={() =>
                              setShowSourceDropdown(!showSourceDropdown)
                            }
                            className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                              paymentMethod ? "text-accent" : ""
                            }`}
                          >
                            Source
                            <MdFilterList
                              className={`w-4 h-4 ${paymentMethod ? "text-accent" : ""}`}
                            />
                          </button>
                          {showSourceDropdown && (
                            <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              {SOURCE_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setPaymentMethod(option.value);
                                    setShowSourceDropdown(false);
                                    setPage(1);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                    paymentMethod === option.value
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
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment: Payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {payment.transaction_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.mpesa_receipt_number !== "WALLET"
                                ? payment.mpesa_receipt_number
                                : payment.wallet_code}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-900">
                              {payment.first_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
                              PURPOSE_STYLES[payment.purpose] ||
                              "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {PURPOSE_LABELS[payment.purpose] || payment.purpose}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {payment.payment_method === "mpesa"
                              ? "M-Pesa"
                              : "Wallet"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {formatAmount(payment.amount)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {formatDate(payment.transaction_time)}
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
