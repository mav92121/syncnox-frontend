import BaseTable from "@/components/BaseTable";
import GoogleMaps from "@/components/GoogleMaps";
import StatusBadge from "@/components/Jobs/StatusBanner";
import { Job } from "@/types/job.type";
import {
  formatTimeWindow,
  paymentStyleMap,
  priorityStyleMap,
  statusStyleMap,
} from "@/utils/jobs.utils";
import { useJobsStore } from "@/zustand/jobs.store";
import { useIndexStore } from "@/zustand/index.store";
import { ColDef } from "ag-grid-community";
import { Button, Typography, Dropdown } from "antd";
import Link from "next/link";
import { EllipsisVertical } from "lucide-react";

const { Title } = Typography;

const Recents = () => {
  const { draftJobs, isLoading, error } = useJobsStore();
  const { setCurrentTab } = useIndexStore();

  const columns: ColDef<Job>[] = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
      pinned: "left",
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
      sortable: false,
      filter: false,
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
    {
      headerName: "Actions",
      pinned: "right",
      lockVisible: true,
      lockPosition: true,
      resizable: false,
      width: 80,
      sortable: false,
      filter: false,
      cellRenderer: () => {
        const menuItems = [
          {
            key: "edit",
            label: "Edit",
          },
          {
            key: "delete",
            label: "Delete",
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center justify-center h-full cursor-pointer">
              <EllipsisVertical size={18} />
            </div>
          </Dropdown>
        );
      },
    },
  ];

  const rowSelection = {
    mode: "multiRow" as const,
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Map - 40% height */}
      <div style={{ height: "40vh" }}>
        <GoogleMaps />
      </div>

      {/* Jobs Section - 60% height */}
      <div className="flex flex-col" style={{ height: "60vh" }}>
        <Title level={4} className="m-0 mb-2 pt-2">
          Jobs
        </Title>

        {/* Table with explicit height */}
        <div className="flex-1 mb-2">
          <BaseTable<Job>
            columnDefs={columns}
            rowData={draftJobs}
            rowSelection={rowSelection}
            loading={isLoading}
            emptyMessage="No jobs to show"
            pagination={true}
            containerStyle={{ height: "100%" }}
          />
        </div>

        {/* Add Job Button */}
        <div>
          <Link href="/plan" onClick={() => setCurrentTab("plan")}>
            <Button type="primary" block size="middle">
              Add More Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Recents;
