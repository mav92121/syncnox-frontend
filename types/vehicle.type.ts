export type VehicleType =
  | "car"
  | "van"
  | "bus"
  | "small_truck"
  | "truck"
  | "scooter"
  | "foot"
  | "bike"
  | "mountain_bike";

export type ConstraintType =
  | "weight"
  | "volume"
  | "item_count"
  | "pallets"
  | "distance"
  | "duration"
  | "custom";

export interface LoadConstraint {
  constraint_type: ConstraintType;
  max_value: number;
  unit: string;
  label?: string; // Used when constraint_type == "custom"
}

export interface Vehicle {
  id: number;
  tenant_id: number;
  team_member_id: number | null;
  name: string;
  load_constraints: LoadConstraint[];
  type: VehicleType | null;
  license_plate: string | null;
  make: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
}
