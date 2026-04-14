export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "farmer" | "farm_supervisor" | "plucker";
  national_id?: string;
  employee_id?: string;
  zone_id?: string;
  supervisor_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "admin" | "farmer" | "farm_supervisor" | "plucker";
  national_id?: string;
  employee_id?: string;
  zone_id?: string;
  supervisor_id?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: string;
  national_id?: string;
  employee_id?: string;
  zone_id?: string;
  supervisor_id?: string;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  supervisor_id?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface UsersResponse {
  data: User[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface UserResponse {
  data: User;
}

interface UserRole {
  id: string;
  name: string;
}