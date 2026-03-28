import { Pagination } from "./pagination";

export interface SalesPersonTransaction {
  id: string;
  transaction_number: string;
  amount: string;
  payment_method: "wallet" | "mpesa";
  status: "completed" | "pending" | "failed";
  purpose: "order_payment" | "wallet_credit";
  order_number: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  mpesa_receipt_number: string;
  wallet_code: string;
}

export interface SalesPersonTransactionsResponse {
  data: SalesPersonTransaction[];
  pagination: Pagination;
}

export interface SalesPersonTransactionsParams {
  page?: number;
  per_page?: number;
  paginate?: boolean;
  search?: string;
  status?: string;
  payment_method?: string;
  purpose?: string;
  start_date?: string;
  to_date?: string;
}
