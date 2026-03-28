import { Pagination } from "./pagination";

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface CustomerAddress {
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  physical_address?: string | null;
  postal_address?: string | null;
  county?: string | null;
  gps_coordinates?: GPSCoordinates;
}

export interface CustomerContacts {
  phone?: string;
  email?: string;
  primary_phone?: string;
  secondary_phone?: string;
  contact_person?: string;
  designation?: string;
}

export interface CustomerMetadata {
  customer_type?: string;
  source?: string;
  business_type?: string;
  registration_number?: string;
  kra_pin?: string;
  established_year?: number;
  employee_count?: number;
  employees?: number;
  monthly_milk_requirement?: string;
  monthly_requirement?: string;
  product_lines?: string[];
  quality_certifications?: string[];
  payment_terms?: string;
  preferred_delivery_schedule?: string;
  hire_date?: string;
  department?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email?: string;
}

export interface CustomerZone {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  kra_pin: string | null;
  account_number?: string;
  customer_id?: string;
  is_tax_exempt?: boolean;
  is_credit_customer?: boolean;
  credit_limit?: number;
  phone?: string;
  address: CustomerAddress | null;
  contacts: CustomerContacts;
  metadata: CustomerMetadata | null;
  created_at: string;
  updated_at: string;
  zone?: CustomerZone | null;
  user?: CustomerUser;
  sales_person?: CustomerUser | null;
  wallet_balance?: string;
  order_count?: number;
  total_spent?: string;
}

export interface CreateCustomerPayload {
  name: string;
  is_tax_exempt?: boolean;
  is_credit_customer?: boolean;
  credit_limit?: number;
  kra_pin?: string;
  sales_person_id?: string;
  zone_id?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  contacts?: {
    phone?: string;
    email?: string;
  };
  metadata?: {
    customer_type?: string;
    source?: string;
  };
}

export interface UpdateCustomerPayload {
  name?: string;
  is_tax_exempt?: boolean;
  is_credit_customer?: boolean;
  credit_limit?: number;
  kra_pin?: string;
  sales_person_id?: string;
  zone_id?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  contacts?: {
    phone?: string;
    email?: string;
  };
  metadata?: {
    customer_type?: string;
    source?: string;
  };
}

export interface CustomersResponse {
  data: Customer[];
  pagination: Pagination;
}

export interface CustomerDetailResponse {
  data: Customer;
  code: number;
  message: string;
  success: boolean;
}
