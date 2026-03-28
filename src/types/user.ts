// User types for Ravine Dairies

// Named reference type for nested objects
export interface NamedReference {
  id: string;
  name: string;
}

// GPS coordinates for address
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

// Address structure
export interface Address {
  physical_address?: string;
  postal_address?: string;
  county?: string;
  gps_coordinates?: GPSCoordinates;
}

// User entity
export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  status: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  region: NamedReference | null;
  zone: NamedReference | null;
  role: NamedReference | null;
}

// Paginated users response
export interface UsersResponse {
  data: User[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// User detail response
export interface UserDetailResponse {
  data: User;
}

// Query params for users endpoint
export interface UsersQueryParams {
  role_id?: string;
  region_id?: string;
  zone_id?: string;
  status?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

// Create user payload
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  region_id?: string;
  zone_id?: string;
  status?: boolean;
  phone?: string;
  identification_type?: "national_id" | "passport" | "military_id";
  id_number?: string;
  address?: Address;
  metadata?: Record<string, any>;
  role_id?: string;
}

// Update user payload
export interface UpdateUserPayload extends Partial<
  Omit<CreateUserPayload, "password">
> {
  password?: string;
}

// User role from /users/roles endpoint
export interface UserRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}
