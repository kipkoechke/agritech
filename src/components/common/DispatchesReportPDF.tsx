"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#334155",
  },
  // Header
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
  // Summary
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
  // Column widths
  colNo: { width: "4%", paddingRight: 4 },
  colDispatch: { width: "13%", paddingRight: 4 },
  colZone: { width: "14%", paddingRight: 4 },
  colTransporter: { width: "15%", paddingRight: 4 },
  colPlate: { width: "10%", paddingRight: 4 },
  colOrders: { width: "8%", textAlign: "right" as const, paddingRight: 8 },
  colAmount: { width: "14%", textAlign: "right" as const, paddingRight: 8 },
  colStatus: { width: "10%", paddingRight: 4 },
  colDate: { width: "12%" },
  // Status styles
  statusDispatched: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  statusDelivered: {
    color: "#059669",
    fontWeight: "bold",
  },
  statusPending: {
    color: "#d97706",
    fontWeight: "bold",
  },
  statusCancelled: {
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

export interface DispatchReportData {
  id: string;
  dispatch_number: string;
  zone_name: string;
  transporter_name: string;
  license_plate: string;
  orders_count: number;
  total_amount: string;
  status: string;
  date: string;
}

export interface DispatchReportSummary {
  total_dispatches: number;
  total_amount: string;
  total_orders: number;
  dispatched_count: number;
  delivered_count: number;
  pending_count: number;
}

interface DispatchesReportPDFProps {
  dispatches: DispatchReportData[];
  summary: DispatchReportSummary;
  dateRange?: { from?: string; to?: string };
  generatedBy?: string;
  reportType?: string;
}

const STATUS_LABELS: Record<string, string> = {
  dispatched: "Dispatched",
  delivered: "Delivered",
  pending: "Pending",
  cancelled: "Cancelled",
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "delivered":
      return styles.statusDelivered;
    case "dispatched":
      return styles.statusDispatched;
    case "pending":
      return styles.statusPending;
    case "cancelled":
      return styles.statusCancelled;
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

export default function DispatchesReportPDF({
  dispatches,
  summary,
  dateRange,
  generatedBy,
  reportType = "Dispatches Report",
}: DispatchesReportPDFProps) {
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
  const pages: DispatchReportData[][] = [];
  for (let i = 0; i < dispatches.length; i += ROWS_PER_PAGE) {
    pages.push(dispatches.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pageDispatches, pageIndex) => (
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
                      Total Dispatches
                    </Text>
                    <Text style={styles.summaryCardValue}>
                      {summary.total_dispatches}
                    </Text>
                    <Text style={styles.summaryCardSubtext}>
                      {summary.total_orders} orders included
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Total Amount</Text>
                    <Text style={styles.summaryCardValue}>
                      KES {summary.total_amount}
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Dispatched</Text>
                    <Text style={styles.summaryCardValue}>
                      {summary.dispatched_count}
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryCardLabel}>Delivered</Text>
                    <Text style={styles.summaryCardValue}>
                      {summary.delivered_count}
                    </Text>
                    <Text style={styles.summaryCardSubtext}>
                      {summary.pending_count} pending
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
                Dispatch Details ({dispatches.length} records)
              </Text>
            )}

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colDispatch]}>
                Dispatch #
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colZone]}>
                Zone
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colTransporter]}>
                Transporter
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colPlate]}>
                License Plate
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colOrders]}>
                Orders
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>
                Amount (KES)
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colStatus]}>
                Status
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>
                Date
              </Text>
            </View>

            {/* Table Rows */}
            {pageDispatches.map((dispatch, idx) => {
              const rowNum = pageIndex * ROWS_PER_PAGE + idx + 1;
              return (
                <View
                  key={dispatch.id}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colNo]}>{rowNum}</Text>
                  <Text style={[styles.tableCellBold, styles.colDispatch]}>
                    {dispatch.dispatch_number}
                  </Text>
                  <Text style={[styles.tableCell, styles.colZone]}>
                    {dispatch.zone_name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTransporter]}>
                    {dispatch.transporter_name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPlate]}>
                    {dispatch.license_plate}
                  </Text>
                  <Text style={[styles.tableCell, styles.colOrders]}>
                    {dispatch.orders_count}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colAmount]}>
                    {dispatch.total_amount}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colStatus,
                      getStatusStyle(dispatch.status),
                    ]}
                  >
                    {STATUS_LABELS[dispatch.status] || dispatch.status}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {dispatch.date}
                  </Text>
                </View>
              );
            })}

            {/* Totals Row — only on last page */}
            {pageIndex === pages.length - 1 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { width: "56%" }]}>
                  Total ({dispatches.length} dispatches)
                </Text>
                <Text style={[styles.totalsValue, { width: "8%" }]}>
                  {summary.total_orders}
                </Text>
                <Text style={[styles.totalsValue, { width: "14%" }]}>
                  KES {summary.total_amount}
                </Text>
                <Text style={{ width: "22%" }} />
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
