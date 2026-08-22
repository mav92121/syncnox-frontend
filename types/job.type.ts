export type JobStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "in_transit"
  | "completed"
  | "cancelled"
  | "failed";

export type JobType =
  | "delivery"
  | "pickup"
  | "service"
  | "one_way"
  | "return_only"
  | "round_trip"
  | "transport";

export type JobTemplateType = "pickup_delivery_job" | "worker_shuttle";

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
  template_type?: JobTemplateType | string;
  status: JobStatus;
  scheduled_date: string;
  job_type: JobType | string;
  
  // Pickup Delivery Fields
  location?: Location;
  address_formatted?: string;
  time_window_start?: string;
  time_window_end?: string;
  service_duration?: number;
  priority_level?: PriorityLevel;
  first_name?: string;
  last_name?: string;
  client_name?: string;
  client_email?: string;
  email?: string;
  business_name?: string;
  phone_number?: string;
  customer_preferences?: string;
  additional_notes?: string;
  recurrence_type?: RecurrenceType;
  documents?: Record<string, unknown>[];
  payment_status?: PaymentStatus;
  pod_notes?: string;
  started_at?: string | null;
  completed_at?: string | null;

  // Worker Shuttle Fields
  quant_id?: string;
  driver_reach_time?: string;
  reach_before_minutes?: number;
  client_id?: string;
  client_phone?: string;
  notes?: string;
  pick_up_address?: string;
  pick_up_location?: Location;
  drop_off_address?: string;
  drop_off_location?: Location;
  client_pick_up_time?: string;

  route_name?: string;
  optimization_id?: number;
  custom_fields?: Record<string, any>;
}

export interface FetchJobsParams {
  skip?: number;
  limit?: number;
  status?: JobStatus;
  date?: string;
  job_ids?: string;
}
