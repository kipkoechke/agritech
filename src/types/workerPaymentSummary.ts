export interface WorkerPaymentSummary {
  worker: {
    id: string;
    name: string;
    phone: string;
    role?: string;
  };
  total_kgs: number;
  total_jobs: number;
}

export interface WorkerPaymentSummaryParams {
  from_date?: string;
  to_date?: string;
  role?: string;
  supervisor_id?: string;
  owner_id?: string;
}

export interface WorkerPaymentSummaryResponse {
  data: WorkerPaymentSummary[];
  summary: {
    total_workers: number;
    total_kgs: number;
  };
}
