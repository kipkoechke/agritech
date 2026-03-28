// Depot Dashboard Types

export interface DepotInfo {
  zone_id: string;
  zone_name: string;
  zone_code: string;
  manager_name: string;
  manager_role: string;
}

export interface DepotPeriod {
  start: string;
  end: string;
}

export interface DepotOverview {
  total_sales_reps: number;
  total_customers: number;
  new_customers: number;
  total_orders: number;
  total_revenue: string;
}

export interface RevenueTrendItem {
  date: string;
  total_revenue: string;
  order_count: number;
}

export interface OrderByStatus {
  delivery_status: string;
  count: number;
}

export interface OrderByPaymentStatus {
  payment_status: string;
  count: number;
}

export interface RevenuePerformance {
  total_revenue: string;
  total_orders: number;
  revenue_trend: RevenueTrendItem[];
  orders_by_status: OrderByStatus[];
  orders_by_payment_status: OrderByPaymentStatus[];
}

export interface MpesaTransactions {
  total_count: number;
  total_amount: string;
}

export interface FinancePerformance {
  outstanding_receivables: string;
  payments_collected: string;
  mpesa_transactions: MpesaTransactions;
}

export interface TopSalesRep {
  sales_person_id: string;
  sales_rep_name: string;
  employee_number: string;
  total_sales: string;
  order_count: number;
}

export interface SalesPerformance {
  top_sales_reps: TopSalesRep[];
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: string;
}

export interface ProductPerformance {
  top_products: TopProduct[];
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  total_spent: string;
  order_count: number;
}

export interface CustomerInsights {
  total_customers: number;
  new_customers: number;
  top_customers: TopCustomer[];
}

export interface DistributionPerformance {
  orders_fulfilled: number;
  orders_pending: number;
  orders_in_transit: number;
  fulfillment_rate: number;
}

export interface DepotDashboardResponse {
  depot_info: DepotInfo;
  period: DepotPeriod;
  overview: DepotOverview;
  revenue_performance: RevenuePerformance;
  finance_performance: FinancePerformance;
  sales_performance: SalesPerformance;
  product_performance: ProductPerformance;
  customer_insights: CustomerInsights;
  distribution_performance: DistributionPerformance;
}
