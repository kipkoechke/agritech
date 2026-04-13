// types/schedule.ts
export interface ScheduleRef {
  id: string;
  email:string;
  name: string;
}

export interface ScheduleZone {
  id: string;
  name: string;
}

export interface ScheduleFarm {
  id: string;
  name: string;
  location:string;
  area:string;
  zone: ScheduleZone;
}

export interface ScheduleWorker {
  id: string;
  name: string;
  phone: string;
}

export interface ScheduleBooking {
  id: string;
  schedule: {
    id: string;
    reference_code: string;
    scheduled_date: string;
    status: string;
    activity: ScheduleRef;
    farm: ScheduleFarm;
  };
  worker: ScheduleWorker;
  is_confirmed: boolean;
  worker_signed: boolean;
  farm_qty: number | null;
  factory_qty: number | null;
  metadata: any | null;
}

export interface BookingsData {
  data: ScheduleBooking[];
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
  bookings_count?: number;
  bookings?: BookingsData;
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