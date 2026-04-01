export interface ScheduleRef {
  id: string;
  name: string;
}

export interface ScheduleZone {
  id: string;
  name: string;
}

export interface ScheduleFarm {
  id: string;
  name: string;
  zone: ScheduleZone;
}

export interface Schedule {
  id: string;
  reference_code: string;
  activity: ScheduleRef;
  farm: ScheduleFarm;
  created_by: ScheduleRef;
  scheduled_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleData {
  farm_id: string;
  farm_activity_id: string;
  scheduled_date: string;
  status?: string;
  notes?: string;
}

export interface UpdateScheduleData {
  farm_id?: string;
  farm_activity_id?: string;
  scheduled_date?: string;
  status?: string;
  notes?: string;
}

export interface SchedulePagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface SchedulesResponse {
  data: Schedule[];
  pagination: SchedulePagination;
}

export interface ScheduleResponse {
  data: Schedule;
}
