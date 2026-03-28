import { Pagination } from "./pagination";

export interface BankTransaction {
  id: string;
  transaction_id: string;
  merchant_reference: string;
  name: string;
  phone_number: string;
  amount: number;
  currency: string;
  status: string;
  narration: string;
  transaction_type: string;
  transaction_date: string;
  used: boolean;
  reconciled_at: string;
  reconciled_by: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    name: string;
    account_number: string | null;
  };
  created_at: string;
}

export interface BankTransactionsResponse {
  data: BankTransaction[];
  pagination: Pagination;
}

export interface BankTransactionsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface ReconcileBankTransactionPayload {
  account_number: string;
  amount: string;
  transaction_date: Date; 
  reference_code: string;
}

