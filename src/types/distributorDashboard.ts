// Distributor Dashboard Types

export interface DistributorDashboardPeriod {
  start: string;
  end: string;
}

export interface DistributorDashboardMetrics {
  total_orders: number;
  total_paid_in_full: number;
  total_pending_payment: number;
  total_partially_paid: number;
}

export interface DistributorDashboardCustomer {
  id: string;
  name: string;
  email: string;
}

export interface DistributorDashboardOrder {
  id: string;
  order_number: string;
  amount: string;
  amount_paid: string;
  payment_status: "pending" | "partially_paid" | "paid";
  delivery_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  created_at: string;
  customer: DistributorDashboardCustomer;
  items_count: number;
}

export interface DistributorDashboardResponse {
  period: DistributorDashboardPeriod;
  metrics: DistributorDashboardMetrics;
  recent_orders: DistributorDashboardOrder[];
}
