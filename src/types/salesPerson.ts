// Sales Person Address
export interface SalesPersonAddress {
  street?: string;
  city?: string;
  postal_code?: string;
}

// Sales Person Contacts
export interface SalesPersonContacts {
  phone?: string;
  email?: string;
}

// Sales Person Metadata
export interface SalesPersonMetadata {
  hire_date?: string;
  department?: string;
  [key: string]: unknown;
}

// Sales Person Zone (nested object)
export interface SalesPersonZone {
  id: string;
  name: string;
}

// Main Sales Person interface
export interface SalesPerson {
  id: string;
  account_number: string;
  employee_number: string;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  contacts?: SalesPersonContacts | null;
  address?: SalesPersonAddress | null;
  metadata?: SalesPersonMetadata | null;
  zone: SalesPersonZone;
  customers_count: number;
  wallet_balance?: string;
  sales_table_id: string;
  created_at: string;
  updated_at: string;
}

// Create payload
export interface CreateSalesPersonPayload {
  name: string;
  email: string;
  zone_id: string;
  phone?: string;
  contacts?: SalesPersonContacts;
  address?: SalesPersonAddress;
  metadata?: SalesPersonMetadata;
}

// Update payload
export interface UpdateSalesPersonPayload {
  name?: string;
  email?: string;
  zone_id?: string;
  phone?: string;
  contacts?: SalesPersonContacts;
  address?: SalesPersonAddress;
  metadata?: SalesPersonMetadata;
  status?: "active" | "inactive";
}

// List response with pagination
export interface SalesPersonsResponse {
  data: SalesPerson[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}
