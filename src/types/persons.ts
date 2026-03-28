export interface Person {
  id: string;
  name: string;
  id_number?: string;
  phone?: string;
  document_type?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface PersonsResponse {
  data: Person[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}
