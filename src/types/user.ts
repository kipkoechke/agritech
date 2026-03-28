export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "farmer" | "farm_supervisor" | "plucker";
  national_id?: string;
  employee_id?: string;
  zone_id?: string;
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
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export interface UsersResponse {
  data: User[];
}
