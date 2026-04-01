export interface HrisUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "farmer" | "supervisor" | "farm_worker" | "admin";
  role_description: string;
  account_number: string | null;
  membership?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHrisUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "farmer" | "supervisor" | "farm_worker" | "admin";
}

export interface UpdateHrisUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: "farmer" | "supervisor" | "farm_worker" | "admin";
}

export interface HrisUserPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface HrisUsersResponse {
  data: HrisUser[];
  pagination: HrisUserPagination;
}

export interface HrisUserResponse {
  data: HrisUser;
}
