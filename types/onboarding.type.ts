export type Industry =
  | "e_commerce"
  | "logistics_freight"
  | "field_service"
  | "food_grocery"
  | "courier_express"
  | "medical_pharmacy"
  | "construction"
  | "other";

export interface Onboarding {
  tenant_id: number;
  is_completed: boolean;
  current_step: number; // 0=welcome, 1=basic, 2=depot, 3=fleet, 4=team
  company_name: string | null;
  industry: string | null;
  user_role?: string | null;
  fleet_size?: string | null;
  stops_per_day?: string | null;
  current_tool?: string | null;
  hearing_source?: string | null;
}

export interface BasicInfoPayload {
  company_name: string;
  industry?: string | null;
  user_role?: string | null;
  fleet_size?: string | null;
  stops_per_day?: string | null;
  current_tool?: string | null;
  hearing_source?: string | null;
}

export const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "ops_manager", label: "Ops Manager" },
];

export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "e_commerce", label: "E-commerce" },
  { value: "courier_express", label: "Courier" },
  { value: "food_grocery", label: "Food & Grocery" },
  { value: "field_service", label: "Field Service" },
  { value: "medical_pharmacy", label: "Medical" },
  { value: "logistics_freight", label: "Logistics" },
];

export const FLEET_SIZE_OPTIONS = [
  { value: "1-5", label: "1-5" },
  { value: "6-20", label: "6-20" },
  { value: "21-50", label: "21-50" },
  { value: "50+", label: "50+" },
];

export const STOPS_PER_DAY_OPTIONS = [
  { value: "under_50", label: "Under 50" },
  { value: "50_200", label: "50-200" },
  { value: "200_500", label: "200-500" },
  { value: "500_plus", label: "500+" },
];

export const CURRENT_TOOL_OPTIONS = [
  { value: "spreadsheets", label: "Spreadsheets" },
  { value: "google_maps", label: "Google Maps" },
  { value: "optimoroute", label: "OptimoRoute" },
  { value: "circuit", label: "Circuit" },
  { value: "routific", label: "Routific" },
  { value: "nothing_yet", label: "Nothing yet" },
];

export const HEARING_SOURCE_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "comparison", label: "Comparison" },
  { value: "other", label: "Other" },
];

