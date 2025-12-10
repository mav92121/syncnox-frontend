export type TeamRoleType = "admin" | "driver" | "manager";
export type TeamStatusType = "active" | "inactive" | "online" | "offline";

export interface Team {
  id: number;
  vehicle_id: string;
  status: TeamStatusType;
  role_type: TeamRoleType;
  external_identifier: string;
  name: string;
  email: string;
  phone_number: string;
  navigation_link_format: string;
  vehicle: string;
  work_start_time: string;
  work_end_time: string;
  allowed_overtime: boolean;
  max_distance: number;
  break_time_start: string;
  break_time_end: string;
  skills: string[];
  fixed_cost_for_driver: number;
  cost_per_km: number;
  cost_per_hr: number;
  cost_per_hr_overtime: number;
  tenant_id: number;
  created_at: string;
  updated_at: string;
}
