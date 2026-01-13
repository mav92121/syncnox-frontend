// Schedule types for the timeline view
// Generalized to support different resource types (drivers, employees, etc.)

export type ScheduleBlockType = "route" | "break" | "job" | "idle" | "depot";

export type ScheduleStatus =
  | "scheduled"
  | "in_transit"
  | "completed"
  | "failed";

export interface ScheduleBlockMetadata {
  route_id?: number;
  stops_count?: number;
  total_distance_meters?: number;
  total_duration_seconds?: number;
  driver_id?: number;
  // Break-specific
  break_duration_minutes?: number;
  break_location_address?: string;
  // Job-specific
  service_duration_minutes?: number;
  job_id?: number;
  address?: string;
  // Idle-specific
  idle_duration_minutes?: number;
}

export interface ScheduleBlock {
  id: string;
  type: ScheduleBlockType;
  start_time: string; // ISO datetime string (UTC)
  end_time: string; // ISO datetime string (UTC)
  title: string;
  status: ScheduleStatus | null;
  metadata: ScheduleBlockMetadata | null;
}

export interface ResourceSchedule {
  resource_id: number;
  resource_name: string;
  resource_type: string; // "driver", "employee", etc.
  blocks: ScheduleBlock[];
}

export interface ScheduleResponse {
  date: string; // YYYY-MM-DD
  resources: ResourceSchedule[];
}

// Status color mapping
export const SCHEDULE_STATUS_COLORS: Record<
  ScheduleStatus | "break" | "idle" | "depot",
  string
> = {
  scheduled: "#faad14", // Yellow
  in_transit: "#1890ff", // Blue
  completed: "#52c41a", // Green
  failed: "#ff4d4f", // Red
  break: "#8c8c8c", // Gray
  idle: "#e6e6e6", // Light Gray
  depot: "#722ed1", // Purple
};

// Helper function to get block color
export function getBlockColor(block: ScheduleBlock): string {
  if (block.type === "break") {
    return SCHEDULE_STATUS_COLORS.break;
  }
  if (block.type === "idle") {
    return SCHEDULE_STATUS_COLORS.idle;
  }
  if (block.type === "depot") {
    return SCHEDULE_STATUS_COLORS.depot;
  }
  return SCHEDULE_STATUS_COLORS[block.status || "scheduled"];
}
