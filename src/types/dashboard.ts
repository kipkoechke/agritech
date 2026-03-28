// Ravine Dairies Dashboard Types

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface TrendChartData {
  data_points: TrendDataPoint[];
  trend_percentage?: number;
  trend_direction?: "up" | "down";
}

export interface DashboardPeriod {
  start: string;
  end: string;
}

export interface RevenueTrendItem {
  date: string;
  total_revenue: string;
  order_count: number;
  total_order_value?: string;
  total_amount_collected?: string;
  total_amount_pending?: string;
}

export interface OrdersByStatus {
  delivery_status: string;
  count: number;
}

export interface OrdersByPaymentStatus {
  payment_status: string;
  count: number;
}

export interface RevenuePerformance {
  total_revenue: string;
  total_order_value?: string;
  total_orders: number;
  total_amount_collected?: string;
  total_amount_pending?: string;
  revenue_trend: RevenueTrendItem[];
  orders_by_status: OrdersByStatus[];
  orders_by_payment_status: OrdersByPaymentStatus[];
  total_dispatched_unpaid?: string;
  total_dispatched_paid?: string;
}
export interface OrderPerformance {
  order_count: string;
  total_order_value: string;
  date: Date;
}

export interface InvoiceAging {
  current: string;
  overdue: string;
}

export interface FinanceCashFlow {
  outstanding_receivables: string;
  payments_collected: string;
  invoice_aging: InvoiceAging;
}

export interface DistributionPerformance {
  orders_fulfilled: number;
  orders_pending: number;
  orders_in_transit: number;
  avg_fulfillment_time: string | null;
}

export interface ProductPerformanceItem {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: string;
}

export interface ProductPerformance {
  top_products: ProductPerformanceItem[];
  slow_moving_products: ProductPerformanceItem[];
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  customer_account_number: string;
  total_spent: string;
  order_count: number;
}

export interface CustomerInsights {
  total_customers: number;
  new_customers: number;
  top_customers: TopCustomer[];
}

export interface OrdersByRegion {
  region_id: string | null;
  order_count: number;
  total_revenue: string;
}

export interface RegionalBreakdown {
  orders_by_region: OrdersByRegion[];
}

export interface OrdersByZone {
  zone_id: string;
  zone_name: string;
  order_count: number;
  total_revenue: string;
}

export interface ZoneBreakdown {
  orders_by_zone: OrdersByZone[];
}

export interface Dashboard {
  period: DashboardPeriod;
  filtered_customer: string | null;
  revenue_performance: RevenuePerformance;
  finance_cash_flow: FinanceCashFlow;
  order_trend: OrderTrendItem[];
  distribution_performance: DistributionPerformance;
  product_performance: ProductPerformance;
  customer_insights: CustomerInsights;
  regional_breakdown: RegionalBreakdown;
  zone_breakdown?: ZoneBreakdown;
}

export interface DashboardParams {
  start_date?: string;
  end_date?: string;
  customer_id?: string;
  region_id?: string;
  zone_id?: string;
  distributor_id?: string;
  sales_person_id?: string;
}

//added for order trend
export interface OrderTrendItem {
  date: string;
  order_count: number;
  total_order_value?: string;
}
