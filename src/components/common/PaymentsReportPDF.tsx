"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register a clean font
Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1e293b",
  },
  // Header
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  reportTitle: {
    fontSize: 12,
    color: "#64748b",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 1,
  },
  headerValue: {
    fontSize: 9,
    color: "#334155",
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  // Summary
  summarySection: {
    marginTop: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: 10,
  },
  summaryCardLabel: {
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  summaryCardSubtext: {
    fontSize: 7,
    color: "#64748b",
  },
  // Table
  tableSection: {
    marginTop: 4,
  },
  tableTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    borderBottomStyle: "solid",
  },
  tableRowAlt: {
    backgroundColor: "#fafbfc",
  },
  tableCell: {
    fontSize: 8,
    color: "#334155",
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },
  // Columns widths
  colNo: { width: "4%", paddingRight: 4 },
  colTxn: { width: "15%", paddingRight: 4 },
  colCustomer: { width: "16%", paddingRight: 4 },
  colPurpose: { width: "12%", paddingRight: 4 },
  colMethod: { width: "10%", paddingRight: 4 },
  colAmount: { width: "12%", textAlign: "right" as const, paddingRight: 8 },
  colStatus: { width: "11%", paddingLeft: 8, paddingRight: 4 },
  colDate: { width: "20%", paddingLeft: 4 },
  // Status badges
  statusCompleted: {
    color: "#059669",
    fontWeight: "bold",
  },
  statusPending: {
    color: "#d97706",
    fontWeight: "bold",
  },
  statusFailed: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
  pageNumber: {
    fontSize: 7,
    color: "#94a3b8",
  },
  // Totals row
  totalsRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f1f5f9",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    borderTopStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    marginTop: 2,
  },
  totalsLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  },
  totalsValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right" as const,
  },
});

export interface PaymentReportData {
  id: string;
  transaction_id: string;
  customer_name: string;
  purpose: string;
  payment_method: string;
  amount: string;
  status: string;
  date: string;
  receipt_number?: string;
}

export interface PaymentReportSummary {
  total_transactions: number;
  total_amount: string;
  order_payments_amount: string;
  order_payments_count: number;
  prepayments_amount: string;
  prepayments_count: number;
  order_payments_total_order_value: string;
}

interface PaymentsReportPDFProps {
  payments: PaymentReportData[];
  summary: PaymentReportSummary;
  dateRange?: { from?: string; to?: string };
  generatedBy?: string;
  reportType?: string;
}

const PURPOSE_LABELS: Record<string, string> = {
  order_payment: "Order Payment",
  wallet_credit: "Wallet Top Up",
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "completed":
      return styles.statusCompleted;
    case "pending":
      return styles.statusPending;
    case "failed":
      return styles.statusFailed;
    default:
      return {};
  }
};

const formatReportDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function PaymentsReportPDF({
  payments,
  summary,
  dateRange,
  generatedBy,
  reportType = "Payments Report",
}: PaymentsReportPDFProps) {
  const generatedAt = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateRangeLabel =
    dateRange?.from && dateRange?.to
      ? `${formatReportDate(dateRange.from)} – ${formatReportDate(dateRange.to)}`
      : dateRange?.from
        ? `From ${formatReportDate(dateRange.from)}`
        : dateRange?.to
          ? `Up to ${formatReportDate(dateRange.to)}`
          : "All Time";

  // Paginate rows — max ~30 rows per page for readability
  const ROWS_PER_PAGE = 28;
  const pages: PaymentReportData[][] = [];
  for (let i = 0; i < payments.length; i += ROWS_PER_PAGE) {
    pages.push(payments.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pagePayments, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          orientation="landscape"
          style={styles.page}
        >
          {/* Header — only on first page */}
          {pageIndex === 0 && (
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.brandName}>Ravine Dairies</Text>
                  <Text style={styles.reportTitle}>{reportType}</Text>
                </View>
                <View style={styles.headerRight}>
                  <Text style={styles.headerLabel}>PERIOD</Text>
                  <Text style={styles.headerValue}>{dateRangeLabel}</Text>
                  <Text style={styles.headerLabel}>GENERATED</Text>
                  <Text style={styles.headerValue}>{generatedAt}</Text>
                  {generatedBy && (
                    <>
                      <Text style={styles.headerLabel}>BY</Text>
                      <Text style={styles.headerValue}>{generatedBy}</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.divider} />

              {/* Summary Cards */}
              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Total Amount Received</Text>
                    <Text style={styles.summaryCardValue}>
                      KES {summary.total_amount}
                    </Text>
                    <Text style={styles.summaryCardSubtext}>
                      {summary.total_transactions} transactions
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Total Order Value</Text>
                    <Text style={styles.summaryCardValue}>
                      KES {summary.order_payments_total_order_value}
                    </Text>
                    <Text style={styles.summaryCardSubtext}>
                      All orders placed via the system
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Wallet Top Ups</Text>
                    <Text style={styles.summaryCardValue}>
                      KES {summary.prepayments_amount}
                    </Text>
                    <Text style={styles.summaryCardSubtext}>
                      {summary.prepayments_count} transactions
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Table Section */}
          <View style={styles.tableSection}>
            {pageIndex === 0 && (
              <Text style={styles.tableTitle}>
                Transaction Details ({payments.length} records)
              </Text>
            )}

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colTxn]}>
                Transaction ID
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colCustomer]}>
                Customer
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colPurpose]}>
                Purpose
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colMethod]}>
                Method
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>
                Amount (KES)
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colStatus]}>
                Status
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            </View>

            {/* Table Rows */}
            {pagePayments.map((payment, idx) => {
              const rowNum = pageIndex * ROWS_PER_PAGE + idx + 1;
              return (
                <View
                  key={payment.id}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colNo]}>{rowNum}</Text>
                  <Text style={[styles.tableCellBold, styles.colTxn]}>
                    {payment.transaction_id}
                  </Text>
                  <Text style={[styles.tableCell, styles.colCustomer]}>
                    {payment.customer_name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPurpose]}>
                    {PURPOSE_LABELS[payment.purpose] || payment.purpose}
                  </Text>
                  <Text style={[styles.tableCell, styles.colMethod]}>
                    {payment.payment_method === "mpesa"
                      ? "M-Pesa"
                      : payment.payment_method === "wallet"
                        ? "Wallet"
                        : payment.payment_method}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colAmount]}>
                    {payment.amount}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colStatus,
                      getStatusStyle(payment.status),
                    ]}
                  >
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {payment.date}
                  </Text>
                </View>
              );
            })}

            {/* Totals Row — only on last page */}
            {pageIndex === pages.length - 1 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { width: "60%" }]}>
                  Total ({payments.length} transactions)
                </Text>
                <Text style={[styles.totalsValue, { width: "14%" }]}>
                  KES {summary.total_amount}
                </Text>
                <Text style={{ width: "26%" }} />
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              Ravine Dairies — {reportType} | Generated: {generatedAt}
            </Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      ))}
    </Document>
  );
}
