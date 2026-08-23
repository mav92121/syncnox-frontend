import { ColDef } from "ag-grid-community";
import Link from "next/link";
import { Job, JobStatus } from "@/types/job.type";
import StatusBadge from "@/components/Jobs/StatusBanner";
import { formatTimeWindow } from "./app.utils";
import { COUNTRY_CODES } from "@/constants/country";
import { Popover, Checkbox } from "antd";
import { useState } from "react";

export const filterCountryOptions = (input: string, option: any): boolean => {
  const searchText = input.toLowerCase();
  const country = COUNTRY_CODES.find(
    (c) => `${c.flag} ${c.code}` === option?.value
  );
  if (!country) return false;

  // Search in country name, code, and country abbreviation
  return (
    country.name.toLowerCase().includes(searchText) ||
    country.code.toLowerCase().includes(searchText) ||
    country.country.toLowerCase().includes(searchText)
  );
};

// Status color mapping
export const STATUS_COLORS: Record<JobStatus, string> = {
  draft: "#808080", // gray
  assigned: "#1677ff",
  in_progress: "#fa8c16",
  in_transit: "#13c2c2",
  completed: "#52c41a",
  cancelled: "#ff4d4f",
  failed: "#ff4d4f",
};

export const priorityStyleMap: Record<string, string> = {
  low: "bg-green-100 text-green-700 border border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  high: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

export const STANDARD_JOB_FIELD_KEYS = new Set([
  "id",
  "scheduled_date",
  "date",
  "job_type",
  "type",
  "status",
  "priority_level",
  "priority",
  "assigned_to",
  "assigned_driver",
  "driver_id",
  "team",
  "team_id",
  "address_formatted",
  "address",
  "delivery_address",
  "location",
  "lat",
  "lng",
  "latitude",
  "longitude",
  "phone_number",
  "phone",
  "customer_phone",
  "first_name",
  "last_name",
  "email",
  "customer_email",
  "business_name",
  "time_window",
  "time_window_start",
  "time_window_end",
  "from",
  "to",
  "service_duration",
  "job_duration",
  "duration",
  "customer_preferences",
  "additional_notes",
  "notes",
  "special_notes",
  "recurrence_type",
  "single_or_recurring",
  "payment_status",
  "client_id",
  "candidate_id",
  "quant_id",
  "quart_id",
  "client_name",
  "client_phone",
  "candidate_phone",
  "client_pick_up_time",
  "start_hour",
  "end_hour",
  "pickup_type",
  "dress_code",
  "go_pickup_point",
  "return_dropoff_point",
  "candidate_address",
  "client_address",
  "driver_reach_time",
  "reach_before_minutes",
  "pick_up_address",
  "drop_off_address",
]);

export const paymentStyleMap: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border border-green-200",
  unpaid: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

export const statusStyleMap: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border border-gray-200",
  assigned: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  in_transit: "bg-blue-100 text-blue-800 border border-blue-200",
  completed: "bg-green-100 text-green-700 border border-green-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

const JOB_STATUS_FILTER_OPTIONS = [
  { value: "draft", label: "Draft", dot: "bg-gray-400" },
  { value: "assigned", label: "Assigned", dot: "bg-blue-500" },
  { value: "completed", label: "Completed", dot: "bg-emerald-500" },
  { value: "all", label: "All", dot: "" },
] as const;

const JobStatusHeader = (props: any) => {
  const { selectedJobTab, handleJobStatusChange } = props;
  const [open, setOpen] = useState(false);

  const activeOption =
    JOB_STATUS_FILTER_OPTIONS.find((opt) => opt.value === selectedJobTab) ||
    JOB_STATUS_FILTER_OPTIONS[0];

  const filterContent = (
    <div className="p-1 min-w-[150px] space-y-1 font-sans">
      <div className="px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
        Filter by Status
      </div>
      {JOB_STATUS_FILTER_OPTIONS.map(({ value, label, dot }) => {
        const isChecked = selectedJobTab === value;
        return (
          <div
            key={value}
            onClick={() => {
              handleJobStatusChange({ target: { value } });
              setOpen(false);
            }}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs ${
              isChecked
                ? "bg-emerald-50 text-emerald-900 font-semibold"
                : "hover:bg-gray-50 text-gray-700 font-medium"
            }`}
          >
            <Checkbox checked={isChecked} />
            {dot && <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />}
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <Popover
      content={filterContent}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      styles={{ container: { padding: 4, borderRadius: 8 } }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between w-full cursor-pointer group py-1 pr-1"
      >
        <span className="font-bold text-sm text-[#003220]">Status</span>
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all text-xs ${
            selectedJobTab !== "all"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
              : "bg-gray-50 border-gray-200 text-gray-600 group-hover:border-gray-300"
          }`}
        >
          {activeOption.dot && (
            <span className={`w-1.5 h-1.5 rounded-full ${activeOption.dot} shrink-0`} />
          )}
          <span className="text-[11px] truncate max-w-[65px]">
            {activeOption.label}
          </span>
          <span className="text-[9px] text-gray-400 group-hover:text-gray-600 transition-transform">
            {open ? "▲" : "▼"}
          </span>
        </div>
      </div>
    </Popover>
  );
};

/**
 * Factory function to create common job table columns.
 * @param options Configuration options for customizing specific columns
 * @returns Array of column definitions for AG Grid
 */
export const createJobTableColumns = (options?: {
  viewColumnRenderer?: (params: any) => any;
  onIdClick?: (job: Job) => void;
  teamsMap?: Record<number, string>;
  jobStatus?: JobStatus;
  templateType?: string;
  statusHeaderProps?: {
    selectedJobTab: string;
    handleJobStatusChange: (e: any) => void;
  };
}): ColDef<Job>[] => {
  const isWorkerShuttle = options?.templateType === "worker_shuttle";

  if (isWorkerShuttle) {
    const shuttleColumns: ColDef<Job>[] = [
      {
        field: "id",
        headerName: "ID",
        width: 100,
        minWidth: 80,
        cellRenderer: (params: any) => {
          const idVal = params.value;
          if (!idVal) return "-";
          if (options?.viewColumnRenderer) {
            return options.viewColumnRenderer(params);
          }
          if (options?.onIdClick) {
            return (
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium cursor-pointer"
                onClick={() => options.onIdClick!(params.data)}
              >
                {idVal}
              </button>
            );
          }
          return <span className="font-medium text-gray-700">{idVal}</span>;
        },
      },
      {
        field: "scheduled_date",
        headerName: "Scheduled Date",
        width: 140,
      },
      {
        field: "status",
        headerName: "Status",
        ...(options?.statusHeaderProps && {
          headerComponent: JobStatusHeader,
          headerComponentParams: options.statusHeaderProps,
        }),
        cellRenderer: (params: any) => (
          <StatusBadge value={params.value} styleMap={statusStyleMap} />
        ),
        width: 160,
      },
      {
        field: "quant_id",
        headerName: "Quart / Shift Ref",
        width: 140,
        valueGetter: (params: any) =>
          params.data?.quant_id ||
          params.data?.quart_id ||
          params.data?.worker_shuttle_detail?.quant_id ||
          params.data?.custom_fields?.quant_id ||
          params.data?.custom_fields?.quart_id ||
          "-",
      },
      {
        field: "job_type",
        headerName: "Job Type",
        width: 130,
        cellRenderer: (params: any) => (
          <span className="capitalize font-medium text-gray-800">
            {String(params.value || "-").replace("_", " ")}
          </span>
        ),
      },
      {
        field: "pick_up_address",
        headerName: "Pick Up Address",
        width: 250,
      },
      {
        field: "drop_off_address",
        headerName: "Drop Off Address",
        width: 250,
      },
      {
        field: "driver_reach_time",
        headerName: "Driver Reach Time",
        width: 160,
      },
      {
        field: "reach_before_minutes",
        headerName: "Reach Window",
        width: 150,
        valueGetter: (params: any) => {
          const mins = params.data?.reach_before_minutes;
          const reach = params.data?.driver_reach_time;
          if (mins === undefined || mins === null || !reach) return "-";
          return `${reach} (${mins > 0 ? "+" : ""}${mins}m)`;
        },
      },
      {
        field: "client_pick_up_time",
        headerName: "Client Pickup Time",
        width: 160,
        valueGetter: (params: any) =>
          params.data?.client_pick_up_time ||
          params.data?.start_hour ||
          params.data?.worker_shuttle_detail?.client_pick_up_time ||
          params.data?.custom_fields?.start_hour ||
          "-",
      },
      {
        field: "client_id",
        headerName: "Client ID",
        width: 130,
        valueGetter: (params: any) =>
          params.data?.client_id ||
          params.data?.worker_shuttle_detail?.client_id ||
          params.data?.custom_fields?.client_id ||
          params.data?.custom_fields?.candidate_id ||
          "-",
      },
      {
        field: "client_name",
        headerName: "Client Name",
        width: 160,
        valueGetter: (params: any) =>
          params.data?.client_name ||
          params.data?.first_name ||
          params.data?.custom_fields?.client_name ||
          params.data?.custom_fields?.first_name ||
          "-",
      },
      {
        field: "client_phone",
        headerName: "Client Phone",
        width: 150,
        valueGetter: (params: any) =>
          params.data?.client_phone ||
          params.data?.phone_number ||
          params.data?.custom_fields?.client_phone ||
          params.data?.custom_fields?.phone_number ||
          "-",
      },
      {
        headerName: "Team",
        field: "assigned_to",
        valueFormatter: (params: any) => {
          if (!params.value) return "";
          return options?.teamsMap?.[params.value] || "Unknown";
        },
      },
      {
        field: "route_name",
        headerName: "Route Name",
        width: 150,
        cellRenderer: (params: any) => {
          if (!params.data.optimization_id || !params.value) {
            return params.value || "-";
          }
          return (
            <Link
              href={`/route/${params.data.optimization_id}`}
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {params.value}
            </Link>
          );
        },
      },
      {
        field: "notes",
        headerName: "Notes",
        width: 160,
        valueGetter: (params: any) =>
          params.data?.notes ||
          params.data?.additional_notes ||
          params.data?.worker_shuttle_detail?.notes ||
          params.data?.custom_fields?.notes ||
          params.data?.custom_fields?.additional_notes ||
          params.data?.custom_fields?.dress_code ||
          "-",
      },
    ];

    if (options?.jobStatus === "draft") {
      return shuttleColumns.filter((col) => col.field !== "route_name");
    }

    return shuttleColumns;
  }

  const allColumns: ColDef<Job>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      minWidth: 80,
      cellRenderer: (params: any) => {
        const idVal = params.value;
        if (!idVal) return "-";
        if (options?.viewColumnRenderer) {
          return options.viewColumnRenderer(params);
        }
        if (options?.onIdClick) {
          return (
            <button
              type="button"
              className="text-blue-600 hover:underline font-medium cursor-pointer"
              onClick={() => options.onIdClick!(params.data)}
            >
              {idVal}
            </button>
          );
        }
        return <span className="font-medium text-gray-700">{idVal}</span>;
      },
    },
    {
      field: "priority_level",
      headerName: "Priority",
      cellRenderer: (params: any) => (
        <StatusBadge value={params.value} styleMap={priorityStyleMap} />
      ),
      width: 130,
      minWidth: 130,
    },
    {
      field: "address_formatted",
      headerName: "Address",
      width: 280,
    },
    {
      field: "status",
      headerName: "Status",
      ...(options?.statusHeaderProps && {
        headerComponent: JobStatusHeader,
        headerComponentParams: options.statusHeaderProps,
      }),
      cellRenderer: (params: any) => (
        <StatusBadge value={params.value} styleMap={statusStyleMap} />
      ),
      width: 180,
      minWidth: 160,
    },
    {
      field: "scheduled_date",
      headerName: "Scheduled Date",
      width: 150,
    },
    {
      field: "route_name",
      headerName: "Route Name",
      width: 150,
      cellRenderer: (params: any) => {
        if (!params.data.optimization_id || !params.value) {
          return params.value || "-";
        }
        return (
          <Link
            href={`/route/${params.data.optimization_id}`}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {params.value}
          </Link>
        );
      },
    },
    {
      headerName: "Team",
      field: "assigned_to",
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        return options?.teamsMap?.[params.value] || "Unknown";
      },
    },
    {
      field: "phone_number",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "service_duration",
      headerName: "Duration (mins)",
      width: 150,
    },
    {
      headerName: "Time Window",
      valueGetter: (params: any) =>
        formatTimeWindow(
          params.data.time_window_start,
          params.data.time_window_end
        ),
      width: 200,
    },
    {
      field: "first_name",
      headerName: "First Name",
      width: 150,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      width: 150,
    },
    {
      field: "business_name",
      headerName: "Business Name",
    },
    {
      field: "customer_preferences",
      headerName: "Customer Preferences",
    },
    {
      field: "additional_notes",
      headerName: "Notes",
      width: 150,
    },
    {
      field: "payment_status",
      headerName: "Payment Status",
      width: 150,
      minWidth: 150,
      cellRenderer: (params: any) => (
        <StatusBadge value={params.value} styleMap={paymentStyleMap} />
      ),
    },
  ];

  if (options?.jobStatus === "draft") {
    return allColumns.filter((col) => col.field !== "route_name");
  }

  return allColumns;
};
