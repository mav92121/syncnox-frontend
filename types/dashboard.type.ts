export interface DashboardKPI {
  total_jobs: number;
  active_routes: number;
  completed_jobs: number;
  scheduled_jobs: number;
  total_drivers: number;
  total_depots: number;
}

export interface OptimizationImpact {
  total_distance_saved_km: number;
  total_time_saved_hours: number;
  vehicles_saved: number;
}

export interface RecentRoute {
  key: string;
  name: string;
  driver: string;
  stops: number;
  completed: number;
  status: string;
}

export interface TopDriver {
  name: string;
  completion_rate: number;
  on_time_rate: number;
}

export interface UpcomingDay {
  date: string;
  jobs: number;
  routes: number;
}

export interface DashboardData {
  kpi: DashboardKPI;
  optimization_impact: OptimizationImpact;
  recent_routes: RecentRoute[];
  top_drivers: TopDriver[];
  upcoming: UpcomingDay[];
}
