export type MenuKey = "basic" | "skills" | "cost";

export interface TeamMemberFormProps {
  initialData?: any;
  onSubmit?: () => void;
}

export const MENU_ITEMS = [
  { key: "basic", label: "Basic Information" },
  { key: "skills", label: "Skills" },
  { key: "cost", label: "Cost" },
];

export const INITIAL_FORM_VALUES = {
  role_type: "driver",
  navigation_link_format: "default",
  vehicle: "car",
  allowed_overtime: false,
  max_distance: 50,
  fixed_cost_for_driver: 0,
  cost_per_km: 1,
  cost_per_hr: 20,
  cost_per_hr_overtime: 30,
};
