"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Modal,
  message,
  Dropdown,
  Flex,
  Typography,
  type MenuProps,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  DownOutlined,
  PlusOutlined,
  UploadOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "@/components/ResizeHandle";
import { useJobsStore } from "@/store/jobs.store";
import { useTeamStore } from "@/store/team.store";
import { ColDef } from "ag-grid-community";
import { Job, JobStatus } from "@/types/job.type";
import { CustomFieldDefinition, getCustomFields } from "@/apis/custom-fields.api";

type JobTab = "all" | JobStatus;

import BaseTable from "@/components/Table/BaseTable";
import JobForm from "@/components/Jobs/JobForm";
import GoogleMaps from "@/components/GoogleMaps";
import MarkerTooltip from "@/components/MarkerTooltip";
import { createJobTableColumns } from "@/utils/jobs.utils";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import CreateRouteModal from "@/app/plan/_components/CreateRouteModal";
import DraftJobsDatePicker from "@/components/Jobs/DraftJobsDatePicker";
import AddJobsModal from "@/app/plan/AddJobsModal";
import BulkUploadModal from "@/components/BulkUploadModal";

const { Title } = Typography;

export default function JobsList() {
  const {
    jobs,
    draftJobs,
    allJobs,
    isLoading: isJobsLoading,
    initializeJobs,
    fetchJobsByStatus,
    fetchAllJobs,
    deleteJobAction,
    deleteJobsAction,
    resetAllJobs,
    selectedDate,
    setSelectedDate,
    draftJobDates,
  } = useJobsStore();

  const { getTeamsMap } = useTeamStore();

  // Tab / Status Filter Selection
  const [selectedJobTab, setSelectedJobTab] = useState<JobTab>("draft");

  // Custom Field definitions
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);

  // Selection & Modals
  const [editJobData, setEditJobData] = useState<Job | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Map state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | string | null>(null);

  // Initialize jobs and load custom field definitions on mount
  useEffect(() => {
    initializeJobs();
    getCustomFields("job")
      .then((defs) => setCustomFields(defs.filter((d) => d.is_visible_in_list)))
      .catch((err) => console.error("Failed to fetch custom fields for jobs", err));
  }, [initializeJobs]);

  const handleJobStatusChange = (e: any) => {
    const value = e.target.value as JobTab;
    setSelectedJobTab(value);
    setSelectedJobIds([]);
    if (value === "all") {
      fetchAllJobs();
    } else {
      fetchJobsByStatus(value as JobStatus);
    }
  };

  const handleDeleteJobsRequest = () => {
    if (selectedJobIds.length === 0) return;

    const count = selectedJobIds.length;

    Modal.confirm({
      title: "Delete Jobs",
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete ${count} selected job(s)?`,
      okText: "Delete",
      okType: "danger",
      okButtonProps: { danger: true, style: { borderRadius: 0 } },
      cancelText: "Cancel",
      cancelButtonProps: { style: { borderRadius: 0 } },
      onOk: async () => {
        try {
          await deleteJobsAction(selectedJobIds, "draft");
          message.success(`Successfully deleted ${count} job(s)`);
          setSelectedJobIds([]);
        } catch (err) {
          message.error("Failed to delete jobs");
          console.error(err);
        }
      },
    });
  };

  useEffect(() => {
    return () => {
      resetAllJobs();
    };
  }, [resetAllJobs]);

  // Status and Date Filtered Jobs
  const rawStatusJobs =
    selectedJobTab === "all"
      ? allJobs
      : selectedJobTab === "draft"
      ? (draftJobs.length > 0 ? draftJobs : jobs.filter((j) => j.status === "draft"))
      : jobs.filter((j) => j.status === selectedJobTab);

  const fallbackSourceJobs = rawStatusJobs.length > 0 ? rawStatusJobs : (allJobs.length > 0 ? allJobs : jobs);

  const dateFilteredJobs = selectedDate
    ? fallbackSourceJobs.filter((j) => j.scheduled_date === selectedDate)
    : fallbackSourceJobs;

  const displayedJobs = dateFilteredJobs.length > 0 ? dateFilteredJobs : fallbackSourceJobs;

  const activeMarkers = displayedJobs
    .filter((job: Job) => job.location?.lat && job.location?.lng)
    .map((job: Job, index: number) => ({
      id: job.id,
      position: { lat: job.location.lat, lng: job.location.lng },
      description: job.address_formatted || "No address",
      duration: job.service_duration,
      timeWindowStart: job.time_window_start,
      timeWindowEnd: job.time_window_end,
      jobType: job.job_type,
      jobData: job,
      sequenceNumber: index + 1,
    }));

  // Build Dynamic Custom Field Columns for AG Grid
  const customFieldColumns: ColDef<Job>[] = customFields.map((f) => ({
    field: `custom_fields.${f.field_key}` as any,
    headerName: f.label,
    valueGetter: (params) => {
      const customData = params.data?.custom_fields;
      if (!customData || customData[f.field_key] === undefined || customData[f.field_key] === null) {
        return "-";
      }
      return String(customData[f.field_key]);
    },
    width: 150,
  }));

  // Base Table Columns (includes Status Header Dropdown)
  const baseColumns = createJobTableColumns({
    viewColumnRenderer: (params: any) => (
      <button
        type="button"
        onClick={() => {
          if (params.data.location?.lat && params.data.location?.lng) {
            setIsMapOpen(true);
            setMapCenter({
              lat: params.data.location.lat,
              lng: params.data.location.lng,
            });
            setSelectedMarkerId(params.data.id);
          }
        }}
        className="text-blue-600 hover:underline font-semibold cursor-pointer border-none bg-transparent p-0"
      >
        {params.value}
      </button>
    ),
    teamsMap: getTeamsMap(),
    jobStatus: selectedJobTab === "all" ? undefined : selectedJobTab,
    statusHeaderProps: {
      selectedJobTab,
      handleJobStatusChange,
    },
  });

  const actionsColumn = createActionsColumn<Job>({
    actions: [
      {
        key: "edit",
        label: "Edit",
        onClick: (record) => setEditJobData(record),
      },
      {
        key: "delete",
        label: "Delete",
        danger: true,
        onClick: (record) => {
          Modal.confirm({
            title: "Delete Job",
            icon: <ExclamationCircleFilled />,
            content: `Are you sure you want to delete job #${record.id}?`,
            okText: "Delete",
            okType: "danger",
            okButtonProps: { danger: true, style: { borderRadius: 0 } },
            cancelText: "Cancel",
            cancelButtonProps: { style: { borderRadius: 0 } },
            onOk: async () => {
              try {
                await deleteJobAction(record.id);
                message.success("Job deleted successfully");
              } catch (err) {
                message.error("Failed to delete job");
                console.error(err);
              }
            },
          });
        },
      },
    ],
  });

  const deliveryColumns = [...baseColumns, ...customFieldColumns, actionsColumn];

  const addJobsMenuItems: MenuProps["items"] = [
    {
      key: "add_single",
      label: "Add Single Job",
      icon: <PlusOutlined />,
      onClick: () => setShowAddJobModal(true),
    },
    {
      key: "bulk_import",
      label: "Bulk Import Jobs",
      icon: <UploadOutlined />,
      onClick: () => setShowBulkUploadModal(true),
    },
  ];

  const tableContent = (
    <div className="h-full w-full p-0 flex flex-col min-h-0 overflow-hidden">
      <BaseTable<Job>
        columnDefs={deliveryColumns}
        rowData={displayedJobs}
        loading={isJobsLoading}
        pagination={true}
        paginationPageSize={100}
        rowSelection="multiple"
        containerClassName="h-full w-full flex-1"
        containerStyle={{ height: "100%", width: "100%" }}
        onSelectionChanged={(event) => {
          if (event.api) {
            const selectedRows = event.api.getSelectedRows().map((r: Job) => r.id);
            setSelectedJobIds(selectedRows);
          }
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Top Bar (Exact same layout as RoutesView) ── */}
      <Flex justify="space-between" gap={36} align="center" className="my-4">
        <Flex gap={24} align="center">
          <Title level={4} className="m-0 pt-2">
            Jobs
          </Title>
          <DraftJobsDatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            draftJobDates={draftJobDates}
          />
        </Flex>

        <Flex gap={8} align="center">
          <Button
            disabled={selectedJobIds.length === 0}
            onClick={() => setShowCreateRouteModal(true)}
          >
            Create New Route
          </Button>

          <Button
            icon={<DeleteOutlined />}
            disabled={selectedJobIds.length === 0}
            onClick={handleDeleteJobsRequest}
          />

          <Button
            icon={<EnvironmentOutlined />}
            type={isMapOpen ? "primary" : "default"}
            onClick={() => setIsMapOpen(!isMapOpen)}
          />

          <Dropdown menu={{ items: addJobsMenuItems }} trigger={["click"]}>
            <Button
              type="primary"
              className="bg-[#003220] hover:bg-[#002417] text-white flex items-center gap-1.5 border-none"
            >
              <span>Add Jobs</span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </Button>
          </Dropdown>
        </Flex>
      </Flex>

      {/* ── Table & Map Area ── */}
      <div className="flex-1 min-h-0 mt-2">
        {isMapOpen ? (
          <PanelGroup direction="vertical" className="h-full w-full">
            <Panel defaultSize={40} minSize={20} className="w-full">
              <div className="h-full w-full relative">
                <GoogleMaps
                  markers={activeMarkers}
                  center={
                    mapCenter ||
                    (activeMarkers.length > 0 ? activeMarkers[0].position : undefined)
                  }
                  zoom={mapCenter ? 17 : 11}
                  selectedMarkerId={selectedMarkerId}
                  InfoWindowModal={({ marker }) => (
                    <MarkerTooltip
                      address={marker.description}
                      duration={marker.duration}
                      timeWindowStart={marker.timeWindowStart}
                      timeWindowEnd={marker.timeWindowEnd}
                      jobType={marker.jobType}
                      jobData={marker.jobData}
                    />
                  )}
                />
                <Button
                  onClick={() => setIsMapOpen(false)}
                  className="absolute top-4 right-4 z-10 bg-white shadow-md font-medium text-xs rounded-none"
                >
                  Close Map
                </Button>
              </div>
            </Panel>
            <ResizeHandle />
            <Panel defaultSize={60} minSize={20} className="w-full">
              {tableContent}
            </Panel>
          </PanelGroup>
        ) : (
          tableContent
        )}
      </div>

      {/* Edit Job Drawer */}
      <Drawer
        title={`Edit Job #${editJobData?.id || ""}`}
        width={540}
        onClose={() => setEditJobData(null)}
        open={Boolean(editJobData)}
        destroyOnClose
      >
        <JobForm
          initialData={editJobData}
          onSubmit={() => setEditJobData(null)}
        />
      </Drawer>

      {/* Add Single Job Modal */}
      <AddJobsModal
        open={showAddJobModal}
        onCancel={() => setShowAddJobModal(false)}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={showBulkUploadModal}
        onCancel={() => setShowBulkUploadModal(false)}
      />

      {/* Create Route Optimization Modal */}
      <CreateRouteModal
        open={showCreateRouteModal}
        setOpen={setShowCreateRouteModal}
        onCancel={() => setShowCreateRouteModal(false)}
        selectedJobIds={selectedJobIds}
      />
    </div>
  );
}
