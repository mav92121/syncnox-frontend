import { useState } from "react";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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
import { Button, Typography, Dropdown, message, Modal, Drawer } from "antd";
import { EllipsisVertical, GripHorizontal } from "lucide-react";
import { deleteJob } from "@/apis/jobs.api";
import JobForm from "@/components/Jobs/JobForm";

const { Title } = Typography;

const Recents = () => {
  const {
    draftJobs,
    deleteJob: deleteJobStore,
    isLoading,
    error,
  } = useJobsStore();
  const { setCurrentTab } = useIndexStore();
  const [editJobData, setEditJobData] = useState<Job | null>(null);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Transform draftJobs into markers for GoogleMaps
  const markers = draftJobs
    .filter((job) => job.location?.lat && job.location?.lng)
    .map((job) => ({
      id: job.id,
      position: {
        lat: job.location.lat,
        lng: job.location.lng,
      },
      description: job.address_formatted || "No address",
    }));

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
      pinned: null,
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
        <Button
          type="link"
          size="small"
          onClick={() => {
            if (params.data.location?.lat && params.data.location?.lng) {
              setMapCenter({
                lat: params.data.location.lat,
                lng: params.data.location.lng,
              });
            }
          }}
        >
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
      cellRenderer: (params: any) => {
        const menuItems = [
          {
            key: "edit",
            label: "Edit",
            onClick: () => {
              setEditJobData(params.data);
            },
          },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            onClick: async () => {
              Modal.confirm({
                title: "Delete Job",
                content: "Are you sure you want to delete this job?",
                okText: "Delete",
                okType: "danger",
                cancelText: "Cancel",
                onOk: async () => {
                  try {
                    await deleteJob(params.data.id);
                    deleteJobStore(params.data.id);
                    console.log("job deleted -> ", params.data.id);
                    message.success("Job deleted successfully");
                  } catch (error) {
                    console.error("Failed to delete job", error);
                    message.error("Failed to delete job");
                  }
                },
              });
            },
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="absolute inset-0">
      <PanelGroup direction="vertical">
        {/* Map Panel - Resizable */}
        <Panel defaultSize={40} minSize={10}>
          <div className="h-full">
            <GoogleMaps
              markers={markers}
              center={mapCenter || undefined}
              zoom={mapCenter ? 17 : undefined}
            />
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="relative h-1 bg-gray-300 hover:bg-blue-500 transition-colors cursor-ns-resize flex items-center justify-center group">
          <div className="absolute flex items-center justify-center">
            <GripHorizontal
              size={30}
              className="text-gray-500 group-hover:text-black transition-colors"
            />
          </div>
        </PanelResizeHandle>

        {/* Jobs Section Panel */}
        <Panel defaultSize={60} minSize={5}>
          <div className="flex flex-col h-full">
            <Title level={4} className="m-0 mb-2 pt-2">
              Jobs
            </Title>

            {/* Table with explicit height */}
            <div className="flex-1 mb-2">
              <BaseTable<Job>
                columnDefs={columns}
                rowData={draftJobs}
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

            {/* Add Job Button */}
            <div>
              <Link href="/plan" onClick={() => setCurrentTab("plan")}>
                <Button type="primary" block size="middle">
                  Add More Jobs
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default Recents;
