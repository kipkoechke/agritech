"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  SalesPerformanceTotalOrder,
  SalesPerformanceDispatchedBalance,
  SalesPerformanceDispatchedPaid,
} from "@/types/salesPerformance";

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
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
    marginTop: 12,
  },
  // Summary
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
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
  // Column widths for total orders
  colRank: { width: "6%", paddingRight: 4 },
  colName: { width: "30%", paddingRight: 4 },
  colEmpNo: { width: "22%", paddingRight: 4 },
  colCount: { width: "16%", textAlign: "right" as const, paddingRight: 8 },
  colValue: { width: "26%", textAlign: "right" as const },
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
});

const formatCurrencyValue = (value: number) =>
  value.toLocaleString("en-KE", { minimumFractionDigits: 2 });

const formatReportDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ---------- Total Orders Report ----------
interface TotalOrdersReportProps {
  data: SalesPerformanceTotalOrder[];
  dateRange?: { from?: string; to?: string };
  generatedBy?: string;
  grandTotal?: {
    total_orders_count: number;
    total_orders_value: number;
  };
}

export function TotalOrdersReportPDF({
  data,
  dateRange,
  generatedBy,
  grandTotal,
}: TotalOrdersReportProps) {
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

  // Filter out sales persons with no orders
  const filteredData = data.filter((d) => d.total_orders > 0);

  // Use grandTotal if provided, otherwise calculate from data
  const totalOrders = grandTotal?.total_orders_count ?? filteredData.reduce((s, d) => s + d.total_orders, 0);
  const totalValue = grandTotal?.total_orders_value ?? filteredData.reduce((s, d) => s + d.total_order_value, 0);

  const ROWS_PER_PAGE = 30;
  const pages: SalesPerformanceTotalOrder[][] = [];
  for (let i = 0; i < filteredData.length; i += ROWS_PER_PAGE) {
    pages.push(filteredData.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageIndex === 0 && (
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.brandName}>Ravine Dairies</Text>
                  <Text style={styles.reportTitle}>
                    Sales Rep Performance — Total Orders
                  </Text>
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

              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Total Sales Reps</Text>
                  <Text style={styles.summaryCardValue}>{filteredData.length}</Text>
                  <Text style={styles.summaryCardSubtext}>
                    with orders
                  </Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Total Orders</Text>
                  <Text style={styles.summaryCardValue}>
                    {totalOrders.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Total Order Value</Text>
                  <Text style={styles.summaryCardValue}>
                    KES {formatCurrencyValue(totalValue)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {pageIndex === 0 && (
            <Text style={styles.sectionTitle}>
              Total Orders by Sales Person ({filteredData.length} records)
            </Text>
          )}

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colRank]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colName]}>
              Sales Person
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colEmpNo]}>
              Employee No.
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colCount]}>
              Orders
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colValue]}>
              Value (KES)
            </Text>
          </View>

          {pageData.map((item, idx) => {
            const rowNum = pageIndex * ROWS_PER_PAGE + idx + 1;
            return (
              <View
                key={item.sales_person_id}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={[styles.tableCell, styles.colRank]}>{rowNum}</Text>
                <Text style={[styles.tableCellBold, styles.colName]}>
                  {item.sales_person_name}
                </Text>
                <Text style={[styles.tableCell, styles.colEmpNo]}>
                  {item.employee_number}
                </Text>
                <Text style={[styles.tableCellBold, styles.colCount]}>
                  {item.total_orders.toLocaleString()}
                </Text>
                <Text style={[styles.tableCellBold, styles.colValue]}>
                  {formatCurrencyValue(item.total_order_value)}
                </Text>
              </View>
            );
          })}

          {pageIndex === pages.length - 1 && (
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, { width: "58%" }]}>
                {grandTotal ? "Grand Total" : "Total"} ({filteredData.length} sales reps)
              </Text>
              <Text style={[styles.totalsValue, { width: "16%" }]}>
                {totalOrders.toLocaleString()}
              </Text>
              <Text style={[styles.totalsValue, { width: "26%" }]}>
                KES {formatCurrencyValue(totalValue)}
              </Text>
            </View>
          )}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              Ravine Dairies — Sales Rep Performance (Total Orders) | Generated:{" "}
              {generatedAt}
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

// ---------- Dispatched Balances Report ----------
interface DispatchedBalancesReportProps {
  data: SalesPerformanceDispatchedBalance[];
  dateRange?: { from?: string; to?: string };
  generatedBy?: string;
  grandTotal?: {
    total_dispatched_unpaid_balance: number;
  };
}

export function DispatchedBalancesReportPDF({
  data,
  dateRange,
  generatedBy,
  grandTotal,
}: DispatchedBalancesReportProps) {
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

  // Filter out sales persons with zero dispatched orders
  const filteredData = data.filter((d) => d.dispatched_orders_count > 0);

  const totalDispatchedOrders = filteredData.reduce(
    (s, d) => s + d.dispatched_orders_count,
    0,
  );
  // Use grandTotal if provided, otherwise calculate from data
  const totalBalance = grandTotal?.total_dispatched_unpaid_balance ?? filteredData.reduce((s, d) => s + d.total_balance, 0);
  const totalPaid = filteredData.reduce((s, d) => s + d.total_paid, 0);

  const ROWS_PER_PAGE = 30;
  const pages: SalesPerformanceDispatchedBalance[][] = [];
  for (let i = 0; i < filteredData.length; i += ROWS_PER_PAGE) {
    pages.push(filteredData.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageIndex === 0 && (
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.brandName}>Ravine Dairies</Text>
                  <Text style={styles.reportTitle}>
                    Sales Rep Performance — Dispatched Unpaid Balances
                  </Text>
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

              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Sales Reps</Text>
                  <Text style={styles.summaryCardValue}>{filteredData.length}</Text>
                  <Text style={styles.summaryCardSubtext}>
                    with outstanding balances
                  </Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Dispatched Orders</Text>
                  <Text style={styles.summaryCardValue}>
                    {totalDispatchedOrders.toLocaleString()}
                  </Text>
                  <Text style={styles.summaryCardSubtext}>with balances</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Partial Payments</Text>
                  <Text style={styles.summaryCardValue}>
                    KES {formatCurrencyValue(totalPaid)}
                  </Text>
                  <Text style={styles.summaryCardSubtext}>on these orders</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Outstanding</Text>
                  <Text style={styles.summaryCardValue}>
                    KES {formatCurrencyValue(totalBalance)}
                  </Text>
                  <Text style={styles.summaryCardSubtext}>unpaid balance</Text>
                </View>
              </View>
            </View>
          )}

          {pageIndex === 0 && (
            <Text style={styles.sectionTitle}>
              Dispatched Orders with Balances ({filteredData.length} records)
            </Text>
          )}

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colRank]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colName]}>
              Sales Person
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colEmpNo]}>
              Employee No.
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colCount]}>
              Dispatched Orders
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colValue]}>
              Partial Payments (KES)
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colValue]}>
              Outstanding (KES)
            </Text>
          </View>

          {pageData.map((item, idx) => {
            const rowNum = pageIndex * ROWS_PER_PAGE + idx + 1;
            return (
              <View
                key={item.sales_person_id}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={[styles.tableCell, styles.colRank]}>{rowNum}</Text>
                <Text style={[styles.tableCellBold, styles.colName]}>
                  {item.sales_person_name}
                </Text>
                <Text style={[styles.tableCell, styles.colEmpNo]}>
                  {item.employee_number}
                </Text>
                <Text style={[styles.tableCellBold, styles.colCount]}>
                  {item.dispatched_orders_count.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.tableCellBold,
                    styles.colValue,
                    { color: "#16a34a" },
                  ]}
                >
                  {formatCurrencyValue(item.total_paid)}
                </Text>
                <Text
                  style={[
                    styles.tableCellBold,
                    styles.colValue,
                    { color: "#dc2626" },
                  ]}
                >
                  {formatCurrencyValue(item.total_balance)}
                </Text>
              </View>
            );
          })}

          {pageIndex === pages.length - 1 && (
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, { width: "48%" }]}>
                {grandTotal ? "Grand Total" : "Total"} ({filteredData.length} sales reps)
              </Text>
              <Text style={[styles.totalsValue, { width: "17%" }]}>
                {totalDispatchedOrders.toLocaleString()}
              </Text>
              <Text
                style={[styles.totalsValue, { width: "17.5%", color: "#16a34a" }]}
              >
                KES {formatCurrencyValue(totalPaid)}
              </Text>
              <Text
                style={[styles.totalsValue, { width: "17.5%", color: "#dc2626" }]}
              >
                KES {formatCurrencyValue(totalBalance)}
              </Text>
            </View>
          )}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              Ravine Dairies — Dispatched Unpaid Balances | Generated:{" "}
              {generatedAt}
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

// ---------- Dispatched Paid Report ----------
interface DispatchedPaidReportProps {
  data: SalesPerformanceDispatchedPaid[];
  dateRange?: { from?: string; to?: string };
  generatedBy?: string;
  summary?: {
    total_paid_orders_count: number;
    total_paid_value: number;
  };
}

export function DispatchedPaidReportPDF({
  data,
  dateRange,
  generatedBy,
  summary,
}: DispatchedPaidReportProps) {
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

  // Filter out sales persons with zero paid orders and only show fully paid (no partial payments)
  const filteredData = data.filter((d) => d.paid_orders_count > 0 && d.partially_paid_orders_count === 0);

  // Use summary if provided, otherwise calculate from data
  const totalPaidOrders = summary?.total_paid_orders_count ?? filteredData.reduce((s, d) => s + d.paid_orders_count, 0);
  const totalPaidValue = summary?.total_paid_value ?? filteredData.reduce((s, d) => s + d.total_paid_value, 0);

  const ROWS_PER_PAGE = 30;
  const pages: SalesPerformanceDispatchedPaid[][] = [];
  for (let i = 0; i < filteredData.length; i += ROWS_PER_PAGE) {
    pages.push(filteredData.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageIndex === 0 && (
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.brandName}>Ravine Dairies</Text>
                  <Text style={styles.reportTitle}>
                    Sales Rep Performance — Amount Paid Against Orders
                  </Text>
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

              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Sales Reps</Text>
                  <Text style={styles.summaryCardValue}>{filteredData.length}</Text>
                  <Text style={styles.summaryCardSubtext}>with payments</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Paid Orders</Text>
                  <Text style={styles.summaryCardValue}>
                    {totalPaidOrders.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardLabel}>Total Amount</Text>
                  <Text style={styles.summaryCardValue}>
                    KES {formatCurrencyValue(totalPaidValue)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {pageIndex === 0 && (
            <Text style={styles.sectionTitle}>
              Dispatched Paid Orders by Sales Person ({filteredData.length} records)
            </Text>
          )}

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colRank]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colName]}>
              Sales Person
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colEmpNo]}>
              Employee No.
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colCount]}>
              Paid Orders
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colValue]}>
              Paid Value (KES)
            </Text>
          </View>

          {pageData.map((item, idx) => {
            const rowNum = pageIndex * ROWS_PER_PAGE + idx + 1;
            return (
              <View
                key={item.sales_person_id}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={[styles.tableCell, styles.colRank]}>{rowNum}</Text>
                <Text style={[styles.tableCellBold, styles.colName]}>
                  {item.sales_person_name}
                </Text>
                <Text style={[styles.tableCell, styles.colEmpNo]}>
                  {item.employee_number}
                </Text>
                <Text style={[styles.tableCellBold, styles.colCount]}>
                  {item.paid_orders_count.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.tableCellBold,
                    styles.colValue,
                    { color: "#059669" },
                  ]}
                >
                  {formatCurrencyValue(item.total_paid_value)}
                </Text>
              </View>
            );
          })}

          {pageIndex === pages.length - 1 && (
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, { width: "58%" }]}>
                Total ({filteredData.length} sales reps)
              </Text>
              <Text style={[styles.totalsValue, { width: "16%" }]}>
                {totalPaidOrders.toLocaleString()}
              </Text>
              <Text
                style={[styles.totalsValue, { width: "26%", color: "#059669" }]}
              >
                KES {formatCurrencyValue(totalPaidValue)}
              </Text>
            </View>
          )}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              Ravine Dairies — Dispatched Paid Orders | Generated: {generatedAt}
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
