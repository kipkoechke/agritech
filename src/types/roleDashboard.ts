// Admin Dashboard Types
export interface AdminDashboardSummary {
  total_farms: number;
  total_workers: number;
  total_farmers: number;
  total_supervisors: number;
  total_factories: number;
  total_zones: number;
  total_activities: number;
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  total_kgs: number;
  factory_qty: number;
}

export interface DailyBooking {
  date: string;
  count: number;
  total_kgs: string | null;
}

export interface ZoneDistribution {
  zone: string;
  farms: number;
  total_size: number;
}

export interface BookingStatus {
  confirmed: number;
  pending: number;
  completed: number;
  factory_received: number;
}

export interface TopWorker {
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  total_kgs: number;
  jobs: number;
}

export interface TopFarm {
  farm: {
    id: string;
    name: string;
  };
  total_kgs: number;
  jobs: number;
}

export interface FactoryPerformance {
  id: string;
  name: string;
  code: string;
  zone: string;
  farms: number;
  clusters: number;
}

export interface FilterOption {
  id: string;
  name: string;
  code?: string;
}

export interface AdminDashboardCharts {
  daily_bookings: DailyBooking[];
  zone_distribution: ZoneDistribution[];
  booking_status: BookingStatus;
  top_workers: TopWorker[];
  top_farms: TopFarm[];
  factory_performance: FactoryPerformance[];
}

export interface AdminDashboardFilters {
  available_zones: FilterOption[];
  available_factories: FilterOption[];
}

export interface AdminDashboardResponse {
  summary: AdminDashboardSummary;
  charts: AdminDashboardCharts;
  filters: AdminDashboardFilters;
  date_range: { from: string; to: string };
}

export interface AdminDashboardParams {
  from_date?: string;
  to_date?: string;
  zone_id?: string;
  factory_id?: string;
  supervisor_id?: string;
  farmer_id?: string;
  farm_id?: string;
}

// Farmer Dashboard Types
export interface FarmerDashboardSummary {
  total_farms: number;
  total_workers: number;
  total_work_groups: number;
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  total_kgs: number;
  monthly_comparison: {
    current_month_kgs: number;
    last_month_kgs: number;
    change_percentage: number;
  };
}

export interface FarmerFarm {
  id: string;
  name: string;
  size: number;
  zone: string;
  factory: string;
  cluster: string;
  supervisor: {
    name: string;
    phone: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface FarmerWorkGroup {
  id: string;
  name: string;
  code: string;
  active: boolean | null;
  members_count: number;
  total_kgs: number;
}

export interface WorkerPaymentChart {
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  total_kgs: number;
  total_jobs: number;
}

export interface DailyProduction {
  date: string;
  total_kgs: string;
  jobs: number;
}

export interface FarmPerformance {
  farm: {
    id: string;
    name: string;
    zone: string;
  };
  size: number;
  total_bookings: number;
  completed: number;
  pending: number;
  total_kgs: number;
}

export interface ActivityBreakdown {
  farm: string;
  activity: string;
  total_kgs: number;
  total_jobs: number;
}

export interface FarmerDashboardCharts {
  worker_payments: WorkerPaymentChart[];
  daily_production: DailyProduction[];
  farm_performance: FarmPerformance[];
  activity_breakdown: ActivityBreakdown[];
}

export interface FarmerDashboardResponse {
  summary: FarmerDashboardSummary;
  farms: FarmerFarm[];
  work_groups: FarmerWorkGroup[];
  charts: FarmerDashboardCharts;
  date_range: { from: string; to: string };
}

export interface FarmerDashboardParams {
  from_date?: string;
  to_date?: string;
  farm_id?: string;
  work_group_id?: string;
}

// Supervisor Dashboard Types
export interface SupervisorDashboardSummary {
  total_assigned_farms: number;
  total_workers: number;
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  total_kgs: number;
}

export interface AssignedFarm {
  farm: {
    id: string;
    name: string;
  };
  owner: string;
  zone: string;
  size: number;
  total_bookings: number;
  completed: number;
  pending: number;
  total_kgs: number;
}

export interface UnconfirmedAttendance {
  booking_id: string;
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  farm: string;
  activity: string;
  scheduled_date: string;
  date: string;
}

export interface PendingQuantityCapture {
  booking_id: string;
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  farm: string;
  activity: string;
  date: string;
}

export interface SupervisorTasks {
  unconfirmed_attendance: UnconfirmedAttendance[];
  pending_quantity_capture: PendingQuantityCapture[];
}

export interface WorkerPerformance {
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  total_kgs: number;
  total_jobs: number;
}

export interface SupervisorDashboardCharts {
  daily_production: DailyProduction[];
  worker_performance: WorkerPerformance[];
}

export interface FarmKgRecord {
  id: string;
  farmer: {
    id: string;
    name: string;
  };
  farm: {
    id: string;
    name: string;
  };
  worker: {
    id: string;
    name: string;
  };
  date: string;
  kgs: number;
  activity: string;
}

export interface FactoryKgRecord {
  id: string;
  factory: {
    id: string;
    name: string;
  };
  weighing_point?: string;
  farm: {
    id: string;
    name: string;
  };
  date: string;
  farm_kgs: number;
  factory_kgs: number;
  discrepancy: number;
  discrepancy_reason?: string;
  receipt_url?: string;
}

export interface SupervisorDashboardResponse {
  summary: SupervisorDashboardSummary;
  assigned_farms: AssignedFarm[];
  tasks: SupervisorTasks;
  charts: SupervisorDashboardCharts;
  farm_kgs?: FarmKgRecord[];
  factory_kgs?: FactoryKgRecord[];
  date_range: { from: string; to: string };
}

export interface SupervisorDashboardParams {
  from_date?: string;
  to_date?: string;
  farm_id?: string;
}
