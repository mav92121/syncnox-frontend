"use client";
import { useState } from "react";
import Link from "next/link";
import { ColDef } from "ag-grid-community";
import { Typography, Button, Drawer } from "antd";
import { useJobsStore } from "@/zustand/jobs.store";
import { useIndexStore } from "@/zustand/index.store";
import { Job } from "@/types/job.type";
import BaseTable from "@/components/Table/BaseTable";
import JobForm from "@/components/Jobs/JobForm";
import {
  formatTimeWindow,
  priorityStyleMap,
  statusStyleMap,
  paymentStyleMap,
} from "@/utils/jobs.utils";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import { deleteJob } from "@/apis/jobs.api";
import StatusBadge from "@/components/Jobs/StatusBanner";

const { Title } = Typography;

export default function JobsList() {
  const { jobs, isLoading, error, deleteJob: deleteJobStore } = useJobsStore();
  const { setCurrentTab } = useIndexStore();
  const [editJobData, setEditJobData] = useState<Job | null>(null);

  const columns: ColDef<Job>[] = [
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
    createActionsColumn<Job>({
      onEdit: (job) => setEditJobData(job),
      onDelete: (jobId) => deleteJobStore(jobId),
      deleteApi: deleteJob,
      entityName: "Job",
    }),
  ];

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <Title level={4} className="m-0">
        Jobs
      </Title>

      <div className="flex-1 min-h-0">
        <BaseTable<Job>
          columnDefs={columns}
          rowData={jobs}
          rowSelection="multiple"
          loading={isLoading}
          emptyMessage="No jobs to show"
          pagination={true}
          containerStyle={{ height: "100%" }}
        />
      </div>

      <Drawer
        onClose={() => setEditJobData(null)}
        title="Edit Job"
        open={editJobData?.id !== undefined}
        size="large"
        placement="right"
      >
        <JobForm
          onSubmit={() => setEditJobData(null)}
          initialData={editJobData}
        />
      </Drawer>

      <div className="pt-2">
        <Link href="/plan" onClick={() => setCurrentTab("plan")}>
          <Button type="primary" block size="middle">
            Add Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
