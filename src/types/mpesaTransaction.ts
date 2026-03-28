import { Pagination } from "./pagination";

export interface MpesaTransaction {
  id: string;
  transaction_id: string;
  trans_id?: string;
  mpesa_transaction_ref: string;
  transaction_number: string;
  transaction_type: string;
  purpose: string;
  order_id: string | null;
  wallet_id: string | null;
  transaction_time?: string;
  trans_time?: string;
  amount: string;
  business_shortcode: string | null;
  bill_ref_number: string;
  invoice_number: string | null;
  first_name: string;
  phone?: string;
  mpesa_receipt_number: string | null;
  wallet_code?: string;
  status: string;
  payment_method?: string;
  used?: boolean;
  reconciled_at: string | null;
  reconciled_by: {
    id: string;
    name: string;
  } | null;
  created_at: string;
}

export interface MpesaTransactionSummary {
  order_payments: {
    total_orders: number;
    orders_with_payments: number;
    fully_paid_orders: number;
    total_transactions: number;
    total_amount: string;
  };
  mpesa_payments: {
    total_transactions: number;
    total_amount: string;
  };
  wallet_payments: {
    total_transactions: number;
    total_amount: string;
  };
  prepayments: {
    total_transactions: number;
    total_amount: string;
  };
}

export interface MpesaTransactionsResponse {
  data: MpesaTransaction[];
  pagination: Pagination;
  summary?: MpesaTransactionSummary;
}

export interface MpesaTransactionsParams {
  page?: number;
  per_page?: number;
  used?: boolean;
  search?: string;
}

export interface ReconcileTransactionPayload {
  account_number: string;
}
