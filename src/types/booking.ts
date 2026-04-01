export interface BookingSchedule {
  id: string;
  reference_code: string;
  scheduled_date: string;
  status: string;
  activity: {
    id: string;
    name: string;
  };
  farm: {
    id: string;
    name: string;
    zone: {
      id: string;
      name: string;
    };
  };
}

export interface BookingWorker {
  id: string;
  name: string;
  phone: string;
}

export interface Booking {
  id: string;
  schedule: BookingSchedule;
  worker: BookingWorker;
  is_confirmed: boolean;
  worker_signed: boolean;
  farm_qty: number | null;
  factory_qty: number | null;
  metadata: unknown;
}

export interface CreateBookingData {
  schedule_id: string;
  worker_id: string;
}

export interface UpdateBookingData {
  schedule_id?: string;
  worker_id?: string;
}

export interface BookingPagination {
  current_page: number;
  next_page: number | null;
  per_page: number;
  first_page: number;
  last_page: number;
  total_pages: number;
  total_items: number;
}

export interface BookingsResponse {
  data: Booking[];
  pagination: BookingPagination;
}

export interface BookingResponse {
  data: Booking;
}
