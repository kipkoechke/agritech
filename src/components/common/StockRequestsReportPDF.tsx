"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#334155",
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  headerValue: {
    fontSize: 9,
    color: "#334155",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    marginBottom: 12,
  },
  summarySection: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 8,
  },
  summaryCardLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryCardValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  summaryCardSubtext: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 2,
  },
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
  // Column widths
  colNo: { width: "5%", paddingRight: 4 },
  colProduct: { width: "22%", paddingRight: 4 },
  colFromZone: { width: "14%", paddingRight: 4 },
  colToZone: { width: "14%", paddingRight: 4 },
  colQuantity: { width: "10%", textAlign: "right" as const, paddingRight: 8 },
  colStatus: { width: "11%", paddingRight: 4 },
  colRequestedBy: { width: "14%", paddingRight: 4 },
  colDate: { width: "10%" },
  // Status styles
  statusPending: {
    color: "#d97706",
    fontWeight: "bold",
  },
  statusApproved: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  statusRejected: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  statusFulfilled: {
    color: "#059669",
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

export interface StockRequestReportData {
  id: string;
  product_names: string;
  from_zone: string;
  to_zone: string;
  quantity: number;
  status: string;
  requested_by: string;
  date: string;
}

export interface StockRequestReportSummary {
  total_requests: number;
  total_quantity: number;
  pending_count: number;
  approved_count: number;
  fulfilled_count: number;
  rejected_count: number;
}

interface StockRequestsReportPDFProps {
  requests: StockRequestReportData[];
  summary: StockRequestReportSummary;
  dateRange?: { from?: string; to?: string };
  generatedBy?: string;
  reportType?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return styles.statusPending;
    case "approved":
      return styles.statusApproved;
    case "rejected":
      return styles.statusRejected;
    case "fulfilled":
      return styles.statusFulfilled;
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

export default function StockRequestsReportPDF({
  requests,
  summary,
  dateRange,
  generatedBy,
  reportType = "Stock Requests Report",
}: StockRequestsReportPDFProps) {
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

  const ROWS_PER_PAGE = 28;
  const pages: StockRequestReportData[][] = [];
  for (let i = 0; i < requests.length; i += ROWS_PER_PAGE) {
    pages.push(requests.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pageRequests, pageIndex) => (
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
                    <Text style={styles.summaryCardLabel}>
                      Total Requests
                    </Text>
                    <Text style={styles.summaryCardValue}>
                      {summary.total_requests}
                    </Text>
                    <Text style={styles.summaryCardSubtext}>
                      {summary.total_quantity} total units
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Pending</Text>
                    <Text style={styles.summaryCardValue}>
                      {summary.pending_count}
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Approved</Text>
                    <Text style={styles.summaryCardValue}>
                      {summary.approved_count}
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Fulfilled</Text>
                    <Text style={styles.summaryCardValue}>
                      {summary.fulfilled_count}
                    </Text>
                    <Text style={styles.summaryCardSubtext}>
                      {summary.rejected_count} rejected
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
                Request Details ({requests.length} records)
              </Text>
            )}

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colProduct]}>
                Product(s)
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colFromZone]}>
                From Zone
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colToZone]}>
                To Zone
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
                Quantity
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colStatus]}>
                Status
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colRequestedBy]}>
                Requested By
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>
                Date
              </Text>
            </View>

            {/* Table Rows */}
            {pageRequests.map((request, idx) => {
              const rowNum = pageIndex * ROWS_PER_PAGE + idx + 1;
              return (
                <View
                  key={request.id}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colNo]}>{rowNum}</Text>
                  <Text style={[styles.tableCellBold, styles.colProduct]}>
                    {request.product_names}
                  </Text>
                  <Text style={[styles.tableCell, styles.colFromZone]}>
                    {request.from_zone}
                  </Text>
                  <Text style={[styles.tableCell, styles.colToZone]}>
                    {request.to_zone}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colQuantity]}>
                    {request.quantity}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colStatus,
                      getStatusStyle(request.status),
                    ]}
                  >
                    {STATUS_LABELS[request.status] || request.status}
                  </Text>
                  <Text style={[styles.tableCell, styles.colRequestedBy]}>
                    {request.requested_by}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {request.date}
                  </Text>
                </View>
              );
            })}

            {/* Totals Row - only on last page */}
            {pageIndex === pages.length - 1 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { width: "41%" }]}>
                  Total ({requests.length} requests)
                </Text>
                <Text style={[styles.totalsValue, { width: "14%" }]} />
                <Text style={[styles.totalsValue, { width: "10%" }]}>
                  {summary.total_quantity}
                </Text>
                <Text style={{ width: "35%" }} />
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              Ravine Dairies — {reportType}
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
