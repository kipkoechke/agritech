import {Pagination} from "./pagination";

export interface Payment {
    id: string;
    transaction_id: string;
    mpesa_transaction_ref: string;
    transaction_number: string;
    transaction_type: string;
    purpose: "order_payment" | "wallet_credit";
    order_id: string | null;
    wallet_id: string;
    transaction_time: string;
    amount: string;
    business_shortcode: string | null;
    bill_ref_number: string;
    invoice_number: string | null;
    first_name: string;
    phone: string;
    mpesa_receipt_number: string;
    wallet_code: string;
    status: "completed" | "pending" | "failed";
    payment_method: "wallet" | "mpesa";
    created_at: string;
}

export interface PaymentSummary {
    order_payments: {
        total_order_value: string;
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

export interface PaymentsResponse {
    data: Payment[];
    pagination: Pagination;
    summary: PaymentSummary;
}

export interface PaymentsParams {
    page?: number;
    per_page?: number;
    paginate?: boolean;
    search?: string;
    status?: string;
    payment_method?: string;
    purpose?: string;
    zone_id?: string;
    customer_id?: string;
    sales_person_id?: string;
    start_date?: string;
    to_date?: string;
}
