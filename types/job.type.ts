export type JobStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";
export type JobType = "delivery" | "pickup" | "service";
export type PriorityLevel = "low" | "medium" | "high";
export type RecurrenceType = "one_time" | "daily" | "weekly" | "monthly";
export type PaymentStatus = "unpaid" | "paid" | "pending";

export interface Location {
  lat: number;
  lng: number;
}

export interface Job {
  id: number;
  tenant_id: number;
  assigned_to?: number;
  status: JobStatus;
  scheduled_date: string;
  job_type: JobType;
  location: Location;
  address_formatted: string;
  time_window_start: string;
  time_window_end: string;
  service_duration: number;
  priority_level: PriorityLevel;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string;
  phone_number?: string;
  customer_preferences: string;
  additional_notes: string;
  recurrence_type: RecurrenceType;
  documents: Record<string, unknown>[];
  payment_status: PaymentStatus;
  pod_notes: string;
  route_name?: string;
  optimization_id?: number;
}

export interface FetchJobsParams {
  skip?: number;
  limit?: number;
  status?: JobStatus;
  date?: string;
  job_ids?: string;
}
