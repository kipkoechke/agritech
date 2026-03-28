export interface Rank {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface RanksResponse {
  data: Rank[];
}
