import { ColDef } from "ag-grid-community";
import { Job } from "@/types/job.type";
import StatusBadge from "@/components/Jobs/StatusBanner";
import { formatTimeWindow } from "./app.utils";
import { COUNTRY_CODES } from "@/constants/country";

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

export const priorityStyleMap: Record<string, string> = {
  low: "bg-green-100 text-green-700 border border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  high: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

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

/**
 * Factory function to create common job table columns.
 * @param options Configuration options for customizing specific columns
 * @returns Array of column definitions for AG Grid
 */
export const createJobTableColumns = (options?: {
  viewColumnRenderer?: (params: any) => any;
}): ColDef<Job>[] => {
  return [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: "left",
      lockPosition: true,
      filter: false,
      resizable: false,
      sortable: false,
    },
    {
      field: "id",
      headerName: "ID",
      width: 80,
      minWidth: 80,
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
      field: "address_formatted",
      headerName: "Address",
      width: 280,
    },
    {
      headerName: "View",
      width: 120,
      ...(options?.viewColumnRenderer && {
        sortable: false,
        filter: false,
        cellRenderer: options.viewColumnRenderer,
      }),
      ...(!options?.viewColumnRenderer && {
        cellRenderer: (params: any) => (
          <button type="button" className="text-blue-600">
            Map View
          </button>
        ),
      }),
    },
    {
      field: "business_name",
      headerName: "Business Name",
    },
    {
      field: "status",
      cellRenderer: (params: any) => (
        <StatusBadge value={params.value} styleMap={statusStyleMap} />
      ),
      width: 130,
      minWidth: 130,
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
      field: "scheduled_date",
      headerName: "Scheduled Date",
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
      field: "customer_preferences",
      headerName: "Customer Preferences",
    },
    {
      field: "additional_notes",
      headerName: "Notes",
      width: 150,
    },
    {
      headerName: "Team",
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
};
