import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export type MenuKey = "basic" | "skillsAndCost" | "mobileApp" | "serviceZones";

export interface TeamMemberFormProps {
  initialData?: any;
  onSubmit?: () => void;
}

export const MENU_ITEMS = [
  { key: "basic", label: "Basic Information" },
  { key: "skillsAndCost", label: "Costs & Skills (Optional)" },
];

export const DEFAULT_DAY_SCHEDULES = {
  monday: { enabled: true, start_time: dayjs("08:00", "HH:mm"), end_time: dayjs("16:00", "HH:mm") },
  tuesday: { enabled: true, start_time: dayjs("08:00", "HH:mm"), end_time: dayjs("16:00", "HH:mm") },
  wednesday: { enabled: true, start_time: dayjs("08:00", "HH:mm"), end_time: dayjs("16:00", "HH:mm") },
  thursday: { enabled: true, start_time: dayjs("08:00", "HH:mm"), end_time: dayjs("16:00", "HH:mm") },
  friday: { enabled: true, start_time: dayjs("08:00", "HH:mm"), end_time: dayjs("16:00", "HH:mm") },
  saturday: { enabled: false, start_time: dayjs("08:00", "HH:mm"), end_time: dayjs("16:00", "HH:mm") },
  sunday: { enabled: false, start_time: dayjs("08:00", "HH:mm"), end_time: dayjs("16:00", "HH:mm") },
};

export const INITIAL_FORM_VALUES = {
  role_type: "driver",
  navigation_link_format: "default",
  allowed_overtime: true,
  max_distance: 200,
  fixed_cost_for_driver: 0,
  cost_per_km: 1,
  cost_per_hr: 20,
  cost_per_hr_overtime: 30,
  start_address: "",
  end_address: "",
  work_start_time: dayjs("08:00", "HH:mm"),
  work_end_time: dayjs("16:00", "HH:mm"),
  day_schedules: DEFAULT_DAY_SCHEDULES,
};
