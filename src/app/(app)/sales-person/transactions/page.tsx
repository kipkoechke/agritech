"use client";

import { useState } from "react";
import { MdPayment, MdPictureAsPdf } from "react-icons/md";
import { useSalesPersonTransactions } from "@/hooks/useSalesPersonPortal";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { FilterSelect } from "@/components/common/FilterSelect";
import ReportModal from "@/components/common/ReportModal";
import PaymentsReportPDF from "@/components/common/PaymentsReportPDF";
import { pdf } from "@react-pdf/renderer";
import toast from "react-hot-toast";
import type { SalesPersonTransaction } from "@/types/salesPersonTransaction";

const PURPOSE_STYLES: Record<string, string> = {
  order_payment: "bg-blue-50 text-blue-700 border-blue-200",
  wallet_credit: "bg-green-50 text-green-700 border-green-200",
};

const PURPOSE_LABELS: Record<string, string> = {
  order_payment: "Order Payment",
  wallet_credit: "Wallet Top Up",
};

export default function SalesPersonTransactionsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { data, isLoading, error } = useSalesPersonTransactions({
    page,
    per_page: 15,
    search: search || undefined,
    payment_method: paymentMethod || undefined,
    purpose: purpose || undefined,
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination;

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
    return `KES ${parseFloat(amount).toLocaleString()}`;
  };

  const handleDownloadPdf = async (reportParams: {
    purpose: string;
    dateFrom: string;
    dateTo: string;
  }) => {
    setIsGeneratingPdf(true);
    try {
      const { getSalesPersonTransactions } =
        await import("@/services/salesPersonPortalService");
      const reportData = await getSalesPersonTransactions({
        paginate: false,
        purpose: reportParams.purpose || undefined,
        start_date: reportParams.dateFrom || undefined,
        to_date: reportParams.dateTo || undefined,
      });

      if (!reportData?.data?.length) {
        toast.error("No transaction data to generate report");
        return;
      }

      const reportPayments = reportData.data.map(
        (txn: SalesPersonTransaction) => ({
          id: txn.id,
          transaction_id: txn.transaction_number,
          customer_name: txn.customer_name,
          purpose: txn.purpose,
          payment_method: txn.payment_method,
          amount: txn.amount,
          status: txn.status,
          date: formatDate(txn.created_at),
          receipt_number:
            txn.mpesa_receipt_number !== "WALLET"
              ? txn.mpesa_receipt_number
              : txn.wallet_code,
        }),
      );

      const totalAmount = reportPayments.reduce(
        (sum: number, p: { amount: string }) => sum + parseFloat(p.amount),
        0,
      );
      const orderPayments = reportPayments.filter(
        (p: { purpose: string }) => p.purpose === "order_payment",
      );
      const walletTopUps = reportPayments.filter(
        (p: { purpose: string }) => p.purpose === "wallet_credit",
      );

      const reportSummary = {
        total_transactions: reportPayments.length,
        total_amount: totalAmount.toLocaleString("en-KE", {
          minimumFractionDigits: 2,
        }),
        order_payments_amount: orderPayments
          .reduce(
            (sum: number, p: { amount: string }) => sum + parseFloat(p.amount),
            0,
          )
          .toLocaleString("en-KE", { minimumFractionDigits: 2 }),
        order_payments_count: orderPayments.length,
        prepayments_amount: walletTopUps
          .reduce(
            (sum: number, p: { amount: string }) => sum + parseFloat(p.amount),
            0,
          )
          .toLocaleString("en-KE", { minimumFractionDigits: 2 }),
        prepayments_count: walletTopUps.length,
        order_payments_total_order_value: "0.00",
      };

      const purposeLabel =
        reportParams.purpose === "order_payment"
          ? "Order Payments"
          : reportParams.purpose === "wallet_credit"
            ? "Wallet Top Ups"
            : "Transactions";

      const blob = await pdf(
        <PaymentsReportPDF
          payments={reportPayments}
          summary={reportSummary}
          dateRange={{ from: reportParams.dateFrom, to: reportParams.dateTo }}
          generatedBy={user?.name}
          reportType={`Sales Person ${purposeLabel} Report`}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `sales-person-transactions-report-${dateStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
      setShowReportModal(false);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load transactions</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-2 md:px-4 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
              <MdPayment className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Transactions
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                {pagination?.total || 0} transactions
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full md:w-48"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FilterSelect
                value={purpose}
                onChange={(value) => {
                  setPurpose(value);
                  setPage(1);
                }}
                options={[
                  { value: "order_payment", label: "Order Payment" },
                  { value: "wallet_credit", label: "Wallet Top Up" },
                ]}
                placeholder="Purpose"
                className="flex-1 md:w-32"
                size="sm"
              />
              <FilterSelect
                value={paymentMethod}
                onChange={(value) => {
                  setPaymentMethod(value);
                  setPage(1);
                }}
                options={[
                  { value: "mpesa", label: "M-Pesa" },
                  { value: "wallet", label: "Wallet" },
                ]}
                placeholder="Method"
                className="flex-1 md:w-28"
                size="sm"
              />
              <button
                onClick={() => setShowReportModal(true)}
                disabled={isGeneratingPdf || !transactions.length}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <MdPictureAsPdf className="w-4 h-4" />
                <span className="hidden md:inline">Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table - Desktop / Card List - Mobile */}
        <div className="bg-white rounded-lg border border-gray-200 flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden flex-1 overflow-auto p-3 space-y-2">
                {transactions.map((txn: SalesPersonTransaction) => (
                  <div
                    key={txn.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatAmount(txn.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {txn.mpesa_receipt_number !== "WALLET"
                            ? txn.mpesa_receipt_number
                            : txn.wallet_code}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                          PURPOSE_STYLES[txn.purpose] ||
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {PURPOSE_LABELS[txn.purpose] || txn.purpose}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>
                        <span className="text-gray-300">Customer:</span>{" "}
                        {txn.customer_name}
                      </span>
                      <span>
                        <span className="text-gray-300">Source:</span>{" "}
                        {txn.payment_method === "mpesa" ? "M-Pesa" : "Wallet"}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-gray-400">
                      <span className="text-gray-300">Date:</span>{" "}
                      {formatDate(txn.created_at)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:flex md:flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Transaction</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Purpose</th>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map((txn: SalesPersonTransaction) => (
                        <tr
                          key={txn.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {txn.transaction_number}
                              </p>
                              <p className="text-xs text-gray-500">
                                {txn.mpesa_receipt_number !== "WALLET"
                                  ? txn.mpesa_receipt_number
                                  : txn.wallet_code}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-gray-900">
                                {txn.customer_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {txn.customer_phone}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
                                PURPOSE_STYLES[txn.purpose] ||
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              {PURPOSE_LABELS[txn.purpose] || txn.purpose}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600">
                              {txn.payment_method === "mpesa"
                                ? "M-Pesa"
                                : "Wallet"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">
                              {formatAmount(txn.amount)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600">
                              {formatDate(txn.created_at)}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
