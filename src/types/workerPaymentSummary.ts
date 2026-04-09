export interface WorkerPaymentSummary {
  worker_id: string;
  worker_name: string;
  worker_phone: string;
  total_kg: number;
  rate_per_kg: number;
  total_amount: number;
  days_worked: number;
}

export interface WorkerPaymentSummaryParams {
  from_date?: string;
  to_date?: string;
}

export interface WorkerPaymentSummaryResponse {
  data: WorkerPaymentSummary[];
}
