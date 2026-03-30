
export type UserRole = "admin" | "farmer" | "supervisor" | "plucker";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  role_description?: string;
  created_at?: string;
  updated_at?: string;
  national_id?: string;
  employee_id?: string;
  zone_id?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
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
