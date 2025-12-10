"use client";
import { useState } from "react";
import Link from "next/link";
import { Typography, Button, Drawer } from "antd";
import { useJobsStore } from "@/zustand/jobs.store";
import { useIndexStore } from "@/zustand/index.store";
import { Job } from "@/types/job.type";
import BaseTable from "@/components/Table/BaseTable";
import JobForm from "@/components/Jobs/JobForm";
import { createJobTableColumns } from "@/utils/jobs.utils";
import { createActionsColumn } from "@/components/Table/ActionsColumn";

const { Title } = Typography;

export default function JobsList() {
  const { jobs, isLoading, error, deleteJobAction } = useJobsStore();
  const { setCurrentTab } = useIndexStore();
  const [editJobData, setEditJobData] = useState<Job | null>(null);

  const columns = [
    ...createJobTableColumns(),
    createActionsColumn<Job>({
      onEdit: (job) => setEditJobData(job),
      onDelete: deleteJobAction,
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
