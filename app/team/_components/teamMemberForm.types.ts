import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export type MenuKey = "basic" | "skillsAndCost";

export interface TeamMemberFormProps {
  initialData?: any;
  onSubmit?: () => void;
}

export const MENU_ITEMS = [
  { key: "basic", label: "Basic Information" },
  { key: "skillsAndCost", label: "Costs & Skills (Optional)" },
];

export const INITIAL_FORM_VALUES = {
  role_type: "driver",
  navigation_link_format: "default",
  vehicle: "car",
  allowed_overtime: false,
  max_distance: 200,
  fixed_cost_for_driver: 0,
  cost_per_km: 1,
  cost_per_hr: 20,
  cost_per_hr_overtime: 30,
  start_address: "",
  end_address: "",
  work_start_time: dayjs("08:00", "HH:mm"),
  work_end_time: dayjs("16:00", "HH:mm"),
};
