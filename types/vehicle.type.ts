export type VehicleType =
  | "car"
  | "small_truck"
  | "truck"
  | "scooter"
  | "foot"
  | "bike"
  | "mountain_bike";

export interface Vehicle {
  id: number;
  tenant_id: number;
  team_member_id: number | null;
  name: string;
  capacity_weight: number | null;
  capacity_volume: number | null;
  type: VehicleType | null;
  license_plate: string | null;
  make: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
}
