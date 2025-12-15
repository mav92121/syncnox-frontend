type OptimizationGoal = "minimum_time" | "minimum_distance";

type OptimizationStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "success";

export interface Stop {
  job_id: number | null;
  stop_type: string;
  arrival_time: string;
  latitude: number;
  longitude: number;
  address_formatted: string;
}

export interface Routes {
  stops: Stop[];
  vehicle_id: number;
  route_polyline: string;
  team_member_id: number;
  team_member_name: string;
  total_distance_meters: number;
  total_duration_seconds: number;
}

interface RouteResult {
  routes: Routes[];
  status: OptimizationStatus;
  generated_at: string;
  optimization_goal: OptimizationGoal;
  unassigned_job_ids: number[];
  total_distance_meters: number;
  total_duration_seconds: number;
}

export interface Route {
  id: number;
  tenant_id: number;
  route_name: string;
  depot_id: number;
  job_ids: number[];
  team_member_ids: number[];
  scheduled_date: string;
  optimization_goal: OptimizationGoal;
  status: OptimizationStatus;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  result: RouteResult;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  avatar_url: string;
}

export interface AllRoutes {
  id: number;
  optimization_id: number;
  name: string;
  status: string;
  total_distance: number;
  total_time: number;
  total_stops: number;
  completed_stops: number;
  failed_stops: number;
  attempted_stops: number;
  rating: number;
  scheduled_date: string;
  assigned_team_members: TeamMember[];
  created_at: string;
  updated_at: string;
}
