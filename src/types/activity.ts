export interface Activity {
  id: string;
  name: string;
  uom: string;
  is_active: boolean;
}

export interface CreateActivityData {
  name: string;
  uom: string;
  is_active?: boolean;
}

export interface UpdateActivityData {
  name?: string;
  uom?: string;
  is_active?: boolean;
}

export interface ActivityPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface ActivitiesResponse {
  data: Activity[];
  pagination: ActivityPagination;
}

export interface ActivityResponse {
  data: Activity;
}
