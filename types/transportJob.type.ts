export type PickupType = "one_way" | "round_trip" | "return_only";

export interface TransportJob {
  id: number;
  tenant_id: number;
  quart_id?: string | null;
  scheduled_date: string;
  start_hour: string;
  end_hour: string;
  pickup_type: PickupType;
  dress_code?: string | null;

  // Candidate
  candidate_id?: string | null;
  candidate_name: string;
  candidate_phone: string;
  candidate_address?: string | null;

  // Client
  client_name: string;
  client_address: string;
  client_longitude?: number | null;
  client_latitude?: number | null;

  // GO Leg
  go_pickup_point?: string | null;
  go_pickup_longitude?: number | null;
  go_pickup_latitude?: number | null;
  go_pickup_time?: string | null;
  go_driver_id?: number | null;
  go_driver_name?: string | null;

  // RETURN Leg
  return_dropoff_point?: string | null;
  return_dropoff_longitude?: number | null;
  return_dropoff_latitude?: number | null;
  return_pickup_time?: string | null;
  return_driver_id?: number | null;
  return_driver_name?: string | null;

  created_at: string;
  updated_at: string;
}

export interface TransportJobCreate {
  quart_id?: string | null;
  scheduled_date: string;
  start_hour: string;
  end_hour: string;
  pickup_type: PickupType;
  dress_code?: string | null;

  candidate_id?: string | null;
  candidate_name: string;
  candidate_phone: string;
  candidate_address?: string | null;

  client_name: string;
  client_address: string;

  go_pickup_point?: string | null;
  return_dropoff_point?: string | null;
}

export interface TransportJobUpdate {
  quart_id?: string | null;
  scheduled_date?: string;
  start_hour?: string;
  end_hour?: string;
  pickup_type?: PickupType;
  dress_code?: string | null;

  candidate_id?: string | null;
  candidate_name?: string;
  candidate_phone?: string;
  candidate_address?: string | null;

  client_name?: string;
  client_address?: string;

  go_pickup_point?: string | null;
  return_dropoff_point?: string | null;
}

export interface TransportJobListResponse {
  items: TransportJob[];
  total: number;
  skip: number;
  limit: number;
}
