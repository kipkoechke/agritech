// Authentication related types and interfaces

export type UserRole =
  | "super-admin"
  | "system-admin"
  | "farm-owner"
  | "farm-manager"
  | "farm-supervisor"
  | "factory-manager"
  | "plucker"
  | "farm-worker"
  | "business-manager"
  | "regional-manager"
  | "regional-supervisor"
  | "sales-manager"
  | "sales-representative"
  | "finance-manager"
  | "finance-officer"
  | "supply-chain-manager"
  | "logistics-coordinator"
  | "field-officer"
  | "customer-service"
  | "data-analyst"
  | "auditor"
  | "customer"
  | "transporter"
  | "sales-person"
  | "depot-manager"
  | "depot-supervisor";

export interface UserZone {
  id: string;
  name: string;
}

export interface UserRole2 {
  id: string;
  name: string;
}

export interface UserMetadata {
  role_description?: string;
  created_by?: string;
  access_level?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  status: boolean;
  paybill: string;
  wallet_balance: string | null;
  metadata: UserMetadata | null;
  zone: string | UserZone | null;
  role: UserRole2;
  profile: string | null;
  salesPerson: unknown | null;
}

export interface User {
  id: string;
  customer_id: string | null;
  name: string;
  email: string;
  account_number: string;
  paybill: string;
  wallet_balance: string | null;
  zone: UserZone | null;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Login response
export interface LoginResponse extends User {
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LogoutResponse {
  message?: string;
}

// Error types
export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

// Token management
export interface TokenData {
  token: string;
  expiresAt?: number;
}

// Middleware types
export interface AuthMiddlewareConfig {
  publicRoutes: string[];
  authRoutes: string[];
  defaultRedirect: string;
  loginRedirect: string;
}
