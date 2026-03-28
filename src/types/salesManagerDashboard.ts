// Sales Manager Dashboard Types

export interface SalesManagerPeriod {
  start: string;
  end: string;
}

export interface SalesManagerOrderStats {
  total: number;
  pendingPayment: number;
  pendingAmount: string;
  dispatched: number;
  void: number;
  cancelled: number;
  readyForDelivery: number;
}

export interface SalesManagerRecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  amount: string;
  delivery_status: string;
  payment_status: string;
  items: number;
  created_at: string;
}

export interface SalesManagerTrendItem {
  date: string;
  total_revenue: string;
  order_count: number;
}

export interface SalesManagerOrderByStatus {
  delivery_status: string;
  count: number;
}

export interface SalesManagerOrderByPaymentStatus {
  payment_status: string;
  count: number;
}

export interface SalesManagerOrderTrend {
  trend: SalesManagerTrendItem[];
  orders_by_status: SalesManagerOrderByStatus[];
  orders_by_payment_status: SalesManagerOrderByPaymentStatus[];
}

export interface SalesManagerDashboardResponse {
  period: SalesManagerPeriod;
  total_customers: number;
  new_customers: number;
  order_stats: SalesManagerOrderStats;
  recent_orders: SalesManagerRecentOrder[];
  orderTrend: SalesManagerOrderTrend;
}
