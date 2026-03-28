// Sales Rep Performance Types

// Total orders entry (grouped by sales person)
export interface SalesPerformanceTotalOrder {
  sales_person_id: string;
  sales_person_name: string;
  employee_number: string;
  total_orders: number;
  total_order_value: number;
}

// Total dispatched orders entry (grouped by sales person)
export interface SalesPerformanceDispatchedTotal {
  sales_person_id: string;
  sales_person_name: string;
  employee_number: string;
  total_dispatched_count: number;
  total_dispatched_value: number;
}

// Dispatched orders with balances (grouped by sales person)
export interface SalesPerformanceDispatchedBalance {
  sales_person_id: string;
  sales_person_name: string;
  employee_number: string;
  dispatched_orders_count: number;
  total_paid: number;
  total_balance: number;
}

// Dispatched orders paid (grouped by sales person)
export interface SalesPerformanceDispatchedPaid {
  sales_person_id: string;
  sales_person_name: string;
  employee_number: string;
  paid_orders_count: number;
  partially_paid_orders_count: number;
  total_paid_value: number;
}

// Pending orders (grouped by sales person)
export interface SalesPerformancePendingOrder {
  sales_person_id: string;
  sales_person_name: string;
  employee_number: string;
  pending_orders_count: number;
  total_pending_value: number;
  pending_but_paid_value: number;
  pending_and_unpaid_value: number;
}

// Order detail for unassigned orders
export interface OrderWithoutSalesPerson {
  order_id: string;
  order_number: string;
  amount: number;
  amount_paid: number;
  outstanding_balance?: number;
  payment_status: string;
  delivery_status: string;
  created_at: string;
  customer: {
    id: string | null;
    name: string | null;
    account_number: string | null;
    issue: string;
  } | null;
}

// Summary interfaces
export interface TotalOrdersSummary {
  total_orders_count: number;
  total_orders_value: number;
}

export interface TotalDispatchedOrdersSummary {
  total_dispatched_count: number;
  total_dispatched_value: number;
  note?: string;
}

export interface DispatchedBalancesSummary {
  total_dispatched_orders_count: number;
  total_paid: number;
  total_outstanding_balance: number;
}

export interface DispatchedPaidSummary {
  total_paid_orders_count: number;
  total_paid_value: number;
  note?: string;
  breakdown: {
    fully_paid_orders: number;
    partially_paid_orders: number;
    total_orders_with_payments: number;
  };
}

export interface PendingOrdersSummary {
  total_pending_orders_count: number;
  total_pending_value: number;
  pending_but_already_paid_value: number;
  pending_and_unpaid_value: number;
  note?: string;
}

export interface DispatchedUnpaidSummary {
  total_orders_count: number;
  total_outstanding_balance: number;
  note?: string;
}

export interface PendingWithoutSalesPersonSummary {
  total_orders_count: number;
  total_value: number;
  note?: string;
}

// Grand total interface
export interface GrandTotal {
  note: string;
  total_orders_count: number;
  total_orders_value: number;
  total_amount_paid: number;
  total_outstanding: number;
  by_delivery_status?: Array<{
    status: string;
    count: number;
    total_value: number;
    total_paid: number;
  }>;
  by_payment_status?: Array<{
    status: string;
    count: number;
    total_value: number;
  }>;
  verification: {
    paid_plus_outstanding: number;
    matches_total_value: boolean;
  };
}

// Full Sales Rep Performance response
export interface SalesPerformanceData {
  grand_total: GrandTotal;
  total_orders: {
    summary: TotalOrdersSummary;
    by_sales_person: SalesPerformanceTotalOrder[];
  };
  total_dispatched_orders: {
    summary: TotalDispatchedOrdersSummary;
    by_sales_person: SalesPerformanceDispatchedTotal[];
  };
  dispatched_with_balances: {
    summary: DispatchedBalancesSummary;
    by_sales_person: SalesPerformanceDispatchedBalance[];
  };
  dispatched_paid: {
    summary: DispatchedPaidSummary;
    by_sales_person: SalesPerformanceDispatchedPaid[];
  };
  pending_orders: {
    summary: PendingOrdersSummary;
    by_sales_person: SalesPerformancePendingOrder[];
  };
  orders_without_sales_person: {
    dispatched_unpaid: {
      summary: DispatchedUnpaidSummary;
      orders: OrderWithoutSalesPerson[];
    };
    pending: {
      summary: PendingWithoutSalesPersonSummary;
      orders: OrderWithoutSalesPerson[];
    };
  };
}

export interface SalesPerformanceResponse {
  data: SalesPerformanceData;
  code: number;
  message: string;
  success: boolean;
}

// Query params for Sales Rep Performance endpoint
export interface SalesPerformanceParams {
  sales_person_id?: string;
  payment_status?: string;
  delivery_status?: string;
  start_date?: string;
  end_date?: string;
}
