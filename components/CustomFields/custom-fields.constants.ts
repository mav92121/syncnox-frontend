import { FieldSurfaces } from "@/apis/custom-fields.api";

export type EntityTab = "job" | "vehicle" | "team_member" | "depot";

export interface BaseFieldDefinition {
  field_key: string;
  label: string;
  data_type: string;
  is_required: boolean;
  description: string;
  group?: "optimization" | "additional" | "pod";
  surfaces?: FieldSurfaces;
}

export const DEFAULT_SURFACES: FieldSurfaces = {
  disp: true,
  driver: false,
  track: false,
  exp: true,
  api: true,
};

export const SURFACES_CONFIG = [
  { key: "disp", label: "D", title: "Dispatch Manager (Web App)" },
  { key: "driver", label: "V", title: "Driver App (Mobile App)" },
  { key: "track", label: "C", title: "Customer Tracking (Tracking Page)" },
  { key: "exp", label: "E", title: "Exports & Reports" },
  { key: "api", label: "A", title: "API Integrations" },
];

export const DEFAULT_BASE_FIELDS: Record<EntityTab, BaseFieldDefinition[]> = {
  job: [
    // ── Section 1: Optimization / Required Fields ──
    {
      field_key: "priority_level",
      label: "Priority",
      data_type: "select",
      is_required: false,
      description: "Priority level of the job (Low, Medium, High)",
      group: "optimization",
      surfaces: { disp: true, driver: true, track: false, exp: true, api: true },
    },
    {
      field_key: "address_formatted",
      label: "Address",
      data_type: "string",
      is_required: true,
      description: "Formatted delivery address",
      group: "optimization",
      surfaces: { disp: true, driver: true, track: true, exp: true, api: true },
    },
    {
      field_key: "scheduled_date",
      label: "Scheduled Date",
      data_type: "date",
      is_required: false,
      description: "Date when job is scheduled",
      group: "optimization",
      surfaces: { disp: true, driver: true, track: false, exp: true, api: true },
    },
    {
      field_key: "time_window",
      label: "Time Window",
      data_type: "string",
      is_required: false,
      description: "Allowed delivery time window",
      group: "optimization",
      surfaces: { disp: true, driver: true, track: false, exp: true, api: true },
    },
    {
      field_key: "service_duration",
      label: "Service Duration",
      data_type: "number",
      is_required: false,
      description: "Duration in minutes",
      group: "optimization",
      surfaces: { disp: true, driver: false, track: false, exp: true, api: true },
    },
    {
      field_key: "package_count",
      label: "Package Count",
      data_type: "number",
      is_required: false,
      description: "Capacity load count",
      group: "optimization",
      surfaces: { disp: true, driver: true, track: false, exp: true, api: true },
    },

    // ── Section 2: Additional Fields ──
    {
      field_key: "client_account",
      label: "Client / Account",
      data_type: "string",
      is_required: false,
      description: "Linked client account",
      group: "additional",
      surfaces: { disp: true, driver: true, track: false, exp: true, api: true },
    },
    {
      field_key: "phone_number",
      label: "Phone",
      data_type: "string",
      is_required: false,
      description: "Customer contact phone",
      group: "additional",
      surfaces: { disp: true, driver: true, track: true, exp: true, api: true },
    },
    {
      field_key: "email",
      label: "Email",
      data_type: "string",
      is_required: false,
      description: "Customer contact email",
      group: "additional",
      surfaces: { disp: true, driver: false, track: false, exp: true, api: true },
    },
    {
      field_key: "business_name",
      label: "Business Name",
      data_type: "string",
      is_required: false,
      description: "Business/company name",
      group: "additional",
      surfaces: { disp: true, driver: false, track: false, exp: true, api: true },
    },
    {
      field_key: "additional_notes",
      label: "Notes",
      data_type: "string",
      is_required: false,
      description: "Special instructions or notes",
      group: "additional",
      surfaces: { disp: true, driver: true, track: false, exp: true, api: true },
    },

    // ── Section 3: Proof of Delivery ──
    {
      field_key: "delivery_photo",
      label: "Delivery Photo",
      data_type: "photo",
      is_required: false,
      description: "Captured drop-off photo",
      group: "pod",
      surfaces: { disp: false, driver: true, track: true, exp: true, api: true },
    },
    {
      field_key: "signature",
      label: "Signature",
      data_type: "signature",
      is_required: false,
      description: "Recipient signature",
      group: "pod",
      surfaces: { disp: false, driver: true, track: true, exp: true, api: true },
    },
    {
      field_key: "reason_fail",
      label: "Reason for Fail",
      data_type: "select",
      is_required: false,
      description: "Failed delivery reason",
      group: "pod",
      surfaces: { disp: false, driver: true, track: false, exp: true, api: true },
    },
  ],

  vehicle: [
    { field_key: "name", label: "Vehicle Name", data_type: "string", is_required: true, description: "Name of the vehicle", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "type", label: "Vehicle Type", data_type: "select", is_required: false, description: "Car, Van, Truck, etc.", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "license_plate", label: "License Plate", data_type: "string", is_required: false, description: "Vehicle license registration", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "make", label: "Make", data_type: "string", is_required: false, description: "Vehicle manufacturer/make", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "model", label: "Model", data_type: "string", is_required: false, description: "Vehicle model", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "load_constraints", label: "Capacity / Load Constraints", data_type: "number", is_required: false, description: "Max weight or volume capacity", group: "additional", surfaces: DEFAULT_SURFACES },
  ],
  team_member: [
    { field_key: "name", label: "Name", data_type: "string", is_required: true, description: "Team member full name", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "email", label: "Email", data_type: "string", is_required: false, description: "Email address", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "phone_number", label: "Phone", data_type: "string", is_required: false, description: "Phone number", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "role_type", label: "Role", data_type: "select", is_required: false, description: "Driver, Admin, Manager", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "work_start_time", label: "Shift Start", data_type: "string", is_required: false, description: "Daily work start time", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "work_end_time", label: "Shift End", data_type: "string", is_required: false, description: "Daily work end time", group: "additional", surfaces: DEFAULT_SURFACES },
  ],
  depot: [
    { field_key: "name", label: "Depot Name", data_type: "string", is_required: true, description: "Depot identifier name", group: "additional", surfaces: DEFAULT_SURFACES },
    { field_key: "address", label: "Depot Address", data_type: "string", is_required: true, description: "Physical location address", group: "additional", surfaces: DEFAULT_SURFACES },
  ],
};
