// Depot Manager Address
export interface DepotManagerAddress {
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

// Depot Manager Contacts
export interface DepotManagerContacts {
  phone?: string;
  email?: string;
  address?: string;
}

// Depot Manager Metadata
export interface DepotManagerMetadata {
  department?: string;
  hire_date?: string;
  notes?: string;
  [key: string]: unknown;
}

// Depot Manager Zone (nested object)
export interface DepotManagerZone {
  id: string;
  name: string;
  code?: string;
}

// Main Depot Manager interface
export interface DepotManager {
  id: string;
  employee_number: string;
  name: string;
  email: string;
  phone: string | null;
  address?: DepotManagerAddress | null;
  contacts?: DepotManagerContacts | null;
  zone: DepotManagerZone;
  status: "active" | "inactive";
  metadata?: DepotManagerMetadata | null;
  created_at: string;
  updated_at: string;
}

// Create payload
export interface CreateDepotManagerPayload {
  name: string;
  email: string;
  zone_id: string;
  phone?: string;
  address?: DepotManagerAddress;
  contacts?: DepotManagerContacts;
  metadata?: DepotManagerMetadata;
}

// Update payload
export interface UpdateDepotManagerPayload {
  name?: string;
  email?: string;
  zone_id?: string;
  phone?: string;
  address?: DepotManagerAddress;
  contacts?: DepotManagerContacts;
  metadata?: DepotManagerMetadata;
  status?: "active" | "inactive";
}

// List response with pagination
export interface DepotManagersResponse {
  data: DepotManager[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// Single depot manager response (detail endpoint)
export interface DepotManagerDetailResponse {
  data: string;
  code: number;
  message: DepotManager;
  success: boolean;
}
