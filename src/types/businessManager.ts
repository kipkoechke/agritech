import { Pagination } from "./pagination";

// User info nested in business manager
export interface BusinessManagerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Business manager entity
export interface BusinessManager {
  id: string;
  name: string;
  employee_number: string;
  email: string;
  phone: string;
  user: BusinessManagerUser;
  created_at: string;
  updated_at: string;
}

// List response with pagination
export interface BusinessManagersResponse {
  data: BusinessManager[];
  pagination: Pagination;
}

// Create payload
export interface CreateBusinessManagerPayload {
  name: string;
  email: string;
  phone: string;
}

// Update payload - all fields optional
export interface UpdateBusinessManagerPayload {
  name?: string;
  email?: string;
  phone?: string;
}
