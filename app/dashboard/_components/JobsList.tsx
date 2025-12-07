"use client";
import { useJobsStore } from "@/zustand/jobs.store";
import { Typography, Button } from "antd";
import { ColDef } from "ag-grid-community";
import { Job } from "@/types/job.type";
import BaseTable from "@/components/BaseTable";
import {
  formatTimeWindow,
  priorityStyleMap,
  statusStyleMap,
  paymentStyleMap,
} from "@/utils/jobs.utils";

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
