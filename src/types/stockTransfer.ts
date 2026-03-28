export interface StockTransferBatch {
  batch_no: string;
  quantity: number;
}

export interface StockTransferItem {
  id: string;
  reference_number: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    unit_of_measure: string;
  };
  from_zone_id: string;
  from_zone: {
    id: string;
    name: string;
    code: string;
  };
  to_zone_id: string;
  to_zone: {
    id: string;
    name: string;
    code: string;
  };
  quantity: number;
  received_quantity: number | null;
  received_date: string | null;
  notes: string | null;
  status: "pending" | "completed" | "cancelled";
  direction: "incoming" | "outgoing";
  batches: StockTransferBatch[] | null;
  created_by: {
    id: string;
    name: string;
    email: string;
  };
  received_by: {
    id: string;
    name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface StockTransferResponse {
  data: StockTransferItem;
}
