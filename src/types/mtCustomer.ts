import { Pagination } from "./pagination";

export interface MTCustomerAddress {
  street?: string;
  city?: string;
  country?: string;
}

export interface MTCustomerContacts {
  email?: string;
  phone?: string;
}

export interface MTCustomerMetadata {
  customer_type?: string;
  source?: string;
}

export interface MTCustomerUser {
  id: string;
  name: string;
  email?: string;
}

export interface MTCustomerZone {
  id: string;
  name: string;
}

export interface MTCustomerSalesPerson {
  id: string;
  name: string;
  email?: string;
}

export interface MTCustomer {
  id: string;
  name: string;
  kra_pin: string | null;
  account_number?: string;
  is_tax_exempt: boolean;
  phone?: string;
  address: MTCustomerAddress | null;
  contacts: MTCustomerContacts | null;
  metadata: MTCustomerMetadata | null;
  customer_id: string;
  created_at: string;
  updated_at: string;
  is_credit_customer: boolean;
  credit_limit: number;
  is_mt: boolean;
  user?: MTCustomerUser;
  zone?: MTCustomerZone | null;
  sales_person?: MTCustomerSalesPerson | null;
  order_count?: number;
  total_spent?: string;
}

export interface CreateMTCustomerPayload {
  name: string;
  is_tax_exempt?: boolean;
  is_credit_customer?: boolean;
  credit_limit?: number;
  kra_pin?: string;
  sales_person_id: string;
  zone_id: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  contacts?: {
    email?: string;
    phone?: string;
  };
  metadata?: {
    customer_type?: string;
    source?: string;
  };
}

export interface UpdateMTCustomerPayload {
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
    email?: string;
    phone?: string;
  };
  metadata?: {
    customer_type?: string;
    source?: string;
  };
}

export interface MTCustomersResponse {
  data: MTCustomer[];
  pagination: Pagination;
}

export interface MTCustomerDetailResponse {
  data: MTCustomer;
  code: number;
  message: string;
  success: boolean;
}

// Product Prices
export interface MTCustomerProductPrice {
  product_id: string;
  product_name?: string;
  price: string | number;
  created_at?: string;
  updated_at?: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    price?: string;
  };
}

export interface SetMTCustomerPricesPayload {
  products: {
    product_id: string;
    price: number;
  }[];
}

export interface MTCustomerPricesResponse {
  message: string;
  data: {
    customer: {
      id: string;
      name: string;
      account: string;
    };
    products: MTCustomerProductPrice[];
  };
  success: boolean;
  code: number;
}
