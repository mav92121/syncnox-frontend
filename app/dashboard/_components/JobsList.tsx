"use client";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { useJobsStore } from "@/zustand/jobs.store";
import { Spin, Typography } from "antd";
import { Job } from "@/types/job.type";
import { formatTimeWindow } from "@/utils/jobs.utils";

const { Title } = Typography;

const renderJobCell = (styleMap: Record<string, string>, value: string) => {
  const className = styleMap[value] || styleMap["default"] || "";
  if (!value) return "";

  return (
    <div className="flex items-center justify-center h-full">
      <span
        className={`inline-flex items-center justify-center min-w-[70px] px-3 py-1 text-xs font-semibold ${className}`}
      >
        {value[0].toUpperCase() + value.slice(1)}
      </span>
    </div>
  );
};

const priorityStyleMap: Record<string, string> = {
  low: "bg-green-100 text-green-700 border border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  high: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

const paymentStyleMap: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border border-green-200",
  unpaid: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

const columns: GridColDef<Job>[] = [
  {
    field: "id",
    headerName: "Job ID",
    width: 90,
    headerAlign: "center",
    align: "center",
    pinnable: true,
    disableReorder: false,
  },
  {
    pinnable: false,
    field: "priority_level",
    align: "center",
    headerAlign: "center",
    headerName: "Priority",
    width: 150,
    renderCell: (params) => renderJobCell(priorityStyleMap, params.value),
  },
  {
    field: "first_name",
    headerName: "First name",
    headerAlign: "center",
    align: "center",
    width: 150,
  },
  {
    field: "last_name",
    headerName: "Last name",
    headerAlign: "center",
    align: "center",
    width: 150,
  },
  {
    field: "address_formatted",
    headerName: "Address",
    headerAlign: "center",
    align: "center",
    width: 250,
    hideable: false,
  },
  {
    field: "map_view",
    headerName: "Map View",
    headerAlign: "center",
    align: "center",
    hideSortIcons: true,
    sortable: false,
    filterable: false,
    width: 150,
  },
  {
    field: "business_name",
    headerName: "Business Name",
    headerAlign: "center",
    align: "center",
    width: 150,
  },
  {
    field: "status",
    headerName: "Status",
    headerAlign: "center",
    align: "center",
    width: 200,
  },
  {
    field: "phone_number",
    headerName: "Phone Number",
    headerAlign: "center",
    align: "center",
    width: 200,
  },
  {
    field: "service_duration",
    headerName: "Service Duration",
    headerAlign: "center",
    align: "center",
    width: 200,
  },
  {
    field: "scheduled_date",
    headerName: "Scheduled Date",
    headerAlign: "center",
    align: "center",
    width: 200,
  },
  {
    field: "time_window_start",
    headerName: "From",
    headerAlign: "center",
    align: "center",
    width: 150,
    valueFormatter: (params) => formatTimeWindow(params),
  },
  {
    field: "time_window_end",
    headerName: "To",
    headerAlign: "center",
    align: "center",
    width: 150,
    valueFormatter: (params) => formatTimeWindow(params),
  },
  {
    field: "customer_preferences",
    headerName: "Customer Preference",
    headerAlign: "center",
    align: "center",
    width: 200,
  },
  {
    field: "additional_notes",
    headerName: "Notes",
    headerAlign: "center",
    align: "center",
    width: 300,
  },
  {
    field: "payment_status",
    headerName: "Payment",
    headerAlign: "center",
    align: "center",
    width: 150,
    renderCell: (params) => renderJobCell(paymentStyleMap, params.value),
  },
];

export default function JobsList() {
  const { filteredJobs, isLoading, error, setStatusFilter } = useJobsStore();
  console.log(filteredJobs);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)]">
        <Spin size="large" />
        <div className="mt-4 text-primary">Loading Jobs...</div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Title level={4}>Jobs</Title>
      <div>
        <DataGrid
          scrollbarSize={16}
          rows={filteredJobs}
          columns={columns}
          columnHeaderHeight={40}
          rowHeight={40}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 20,
              },
            },
          }}
          pageSizeOptions={[20]}
          // checkboxSelection
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
}
