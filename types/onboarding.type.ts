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
  industry: Industry | null;
}

export interface BasicInfoPayload {
  company_name: string;
  industry: Industry;
}

export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "e_commerce", label: "E-commerce" },
  { value: "logistics_freight", label: "Logistics & Freight" },
  { value: "field_service", label: "Field Service" },
  { value: "food_grocery", label: "Food & Grocery" },
  { value: "courier_express", label: "Courier & Express" },
  { value: "medical_pharmacy", label: "Medical & Pharmacy" },
  { value: "construction", label: "Construction" },
  { value: "other", label: "Other" },
];
