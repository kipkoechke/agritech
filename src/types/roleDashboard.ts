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
  revenue: number;
}

export interface DailyBooking {
  date: string;
  count: number;
  total_kgs: number;
}

export interface ZoneDistribution {
  zone_id: string;
  zone: string;
  farm_count: number;
  total_size: number;
  kgs_collected: number;
  farmers_count: number;
  revenue: number;
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
    zone: string | null;
  };
  total_kgs: number;
  jobs: number;
  days_worked: number;
  farms_worked: number;
  avg_kgs_per_job: number;
  revenue: number;
}

export interface TopFarm {
  farm: {
    id: string;
    name: string;
    zone: string;
    owner: null;
  } | null;
  total_kgs: number;
  jobs: number;
  workers_count: number;
  days_active: number;
  avg_kgs_per_job: number;
  revenue: number;
}

export interface FactoryPerformance {
  id: string;
  name: string;
  code: string;
  zone: string;
  farms: number;
  clusters: number;
  total_kgs: number;
  workers_count: number;
  revenue: number;
}

export interface FilterOption {
  id: string;
  name: string;
  code?: string;
}

export interface AdminDashboardCharts {
  daily_bookings: DailyBooking[];
  top_10_zone_distribution: ZoneDistribution[];
  booking_status: BookingStatus;
  top_10_workers: TopWorker[];
  top_10_farms: TopFarm[];
  top_10_factories: FactoryPerformance[];
}

export interface AdminDashboardResponse {
  summary: AdminDashboardSummary;
  charts: AdminDashboardCharts;
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
  revenue: number;
  monthly_comparison: {
    current: number;
    last: number;
    change: number;
  };
}

export interface FarmerFarm {
  id: string;
  name: string;
  size: number;
  zone: string;
  factory: string | null;
  cluster: string | null;
  supervisor: {
    name: string;
    phone: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface FarmerWorkGroup {
  id: string;
  name: string;
  members: number;
  active: boolean | null;
  plucker_rate?: number;
  supervisor_rate?: number;
}

export interface WorkerJobDetail {
  date: string;
  kgs: number;
  role: string;
  work_group_id?: string;
}

export interface WorkerPaymentChart {
  worker: {
    id: string;
    name: string;
    phone: string;
  };
  work_group: {
    id: string;
    name: string;
    plucker_rate: number;
    supervisor_rate: number;
  };
  jobs: WorkerJobDetail[];
  total_kgs: number;
}

export interface ScheduleProductionWorker {
  booking: {
    id: string;
  };
  worker: {
    id: string;
    name: string;
  };
  farm_qty: number;
  factory_qty: number;
  kgs_to_pay: number;
  rate: number;
  amount: number;
}

export interface ScheduleProduction {
  schedule: {
    id: string;
    code: string;
  };
  scheduled_date: string;
  farm: {
    id: string;
    name: string;
  };
  supervisor: {
    id: string;
    name: string;
  };
  bookings: ScheduleProductionWorker[];
  total_farm_kgs: number;
  total_factory_kgs: number;
  total_workers_amount: number;
  supervisor_amount: number;
}

export interface DailyProduction {
  date: string;
  total_kgs: string;
  jobs: number;
}

export interface SupervisorDailyProduction {
  date: string;
  total_kgs: number;
  jobs: number;
}

export interface UpcomingSchedule {
  id: string;
  reference_code: string;
  farm: string;
  activity: string;
  scheduled_date: string;
  status: string;
  notes: string | null;
}

export interface FarmPerformance {
  farm: {
    id: string;
    name: string;
    zone: string;
  };
  size: number;
  total_jobs: number;
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
  schedule_production: ScheduleProduction[];
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
  worker_id?: string;
  supervisor_id?: string;
}

// Supervisor Dashboard Types
export interface SupervisorDashboardSummary {
  total_my_farms: number;
  total_my_workgroups: number;
  total_workers: number;
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  net_kgs: number;
  revenue: number;
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
  jobs: number;
}

export interface SupervisorDashboardCharts {
  daily_production: SupervisorDailyProduction[];
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
  upcoming_schedules: UpcomingSchedule[];
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
