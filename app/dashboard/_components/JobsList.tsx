"use client";
import { useJobsStore } from "@/zustand/jobs.store";
import { Typography, Button } from "antd";
import { ColDef } from "ag-grid-community";
import { Job } from "@/types/job.type";
import BaseTable from "@/components/BaseTable";

const { Title } = Typography;

// Reusable Badge Component for scalable cell rendering
const StatusBadge = ({
  value,
  styleMap,
}: {
  value: string;
  styleMap: Record<string, string>;
}) => {
  const style = styleMap[value] || styleMap.default;
  return (
    <div className="flex text-center items-center justify-start h-full w-full">
      <span className={`${style} px-3 text-sm font-medium min-w-[100px]`}>
        {value[0].toUpperCase() + value.slice(1)}
      </span>
    </div>
  );
};

const formatTimeWindow = (timeWindow: string | null) => {
  if (!timeWindow) return "";
  const [hours, minutes] = timeWindow.split("T")[1].split(":");
  return `${hours}:${minutes}`;
};

export default function JobsList() {
  const { jobs, isLoading, error } = useJobsStore();

  const columns: ColDef<Job>[] = [
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
      cellRenderer: (params: any) => (
        <Button type="link" size="small">
          Map View
        </Button>
      ),
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
      field: "time_window_start",
      headerName: "Time Window Start",
      width: 200,
      valueGetter: (params: any) =>
        formatTimeWindow(params.data.time_window_start),
    },
    {
      field: "time_window_end",
      headerName: "Time Window End",
      width: 200,
      valueGetter: (params: any) =>
        formatTimeWindow(params.data.time_window_end),
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

  const rowSelection = {
    mode: "multiRow" as const,
    headerCheckbox: true,
  };

  const priorityStyleMap: Record<string, string> = {
    low: "bg-green-100 text-green-700 border border-green-200 py-1 ",
    medium: "bg-yellow-100 text-yellow-800 border border-yellow-200 py-1 ",
    high: "bg-red-100 text-red-800 border border-red-200 py-1 ",
    default: "bg-gray-100 text-gray-700 border border-gray-200 py-1 ",
  };

  const paymentStyleMap: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border border-green-200 py-1.5 ",
    unpaid: "bg-red-100 text-red-800 border border-red-200 py-1.5 ",
    default: "bg-gray-100 text-gray-700 border border-gray-200 py-1.5 ",
  };

  const statusStyleMap: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 border border-gray-200 py-1.5 ",
    scheduled: "bg-yellow-100 text-yellow-800 border border-yellow-200 py-1.5 ",
    completed: "bg-green-100 text-green-700 border border-green-200 py-1.5 ",
    default: "bg-gray-100 text-gray-700 border border-gray-200 py-1.5 ",
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <Title level={4} className="shrink-0 m-0">
        Jobs
      </Title>

      <BaseTable<Job>
        columnDefs={columns}
        rowData={jobs}
        rowSelection={rowSelection}
        loading={isLoading}
        emptyMessage="No jobs to show"
        pagination={true}
        bottomOffset={46}
      />

      <div className="shrink-0">
        <Button type="primary" block size="middle">
          Add Job
        </Button>
      </div>
    </div>
  );
}
