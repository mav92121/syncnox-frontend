"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Drawer,
  Modal,
  Flex,
  Radio,
  message,
  Dropdown,
  type MenuProps,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  DownOutlined,
} from "@ant-design/icons";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "@/components/ResizeHandle";
import { useJobsStore } from "@/store/jobs.store";
import { useTeamStore } from "@/store/team.store";
import { Job, JobStatus } from "@/types/job.type";

type JobTab = "all" | JobStatus;
import BaseTable from "@/components/Table/BaseTable";
import JobForm from "@/components/Jobs/JobForm";
import GoogleMaps from "@/components/GoogleMaps";
import MarkerTooltip from "@/components/MarkerTooltip";
import { createJobTableColumns } from "@/utils/jobs.utils";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import CreateRouteModal from "@/app/plan/_components/CreateRouteModal";
import DraftJobsDatePicker from "@/components/Jobs/DraftJobsDatePicker";
import { useIndexStore } from "@/store/index.store";
import AddJobsModal from "@/app/plan/AddJobsModal";
import BulkUploadModal from "@/components/BulkUploadModal";

const { Title } = Typography;

export default function JobsList() {
  const {
    jobs,
    draftJobs,
    allJobs,
    isLoading,
    error,
    deleteJobAction,
    deleteJobsAction,
    fetchJobsByStatus,
    fetchAllJobs,
    resetAllJobs,
    selectedDate,
    setSelectedDate,
    draftJobDates,
  } = useJobsStore();
  const { setCurrentTab } = useIndexStore();
  const { getTeamsMap } = useTeamStore();
  const [editJobData, setEditJobData] = useState<Job | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [selectedJobTab, setSelectedJobTab] = useState<JobTab>("all");
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Map state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    number | string | null
  >(null);

  const handleDeleteJobsRequest = () => {
    if (selectedJobIds.length === 0) return;

    Modal.confirm({
      title: "Delete Jobs",
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete ${selectedJobIds.length} jobs?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteJobsAction(selectedJobIds, "draft");
          message.success(`Successfully deleted ${selectedJobIds.length} jobs`);
          setSelectedJobIds([]);
        } catch (err) {
          message.error("Failed to delete jobs");
          console.error(err);
        }
      },
    });
  };

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

  useEffect(() => {
    return () => {
      resetAllJobs();
    };
  }, []);

  // Transform jobs into markers for GoogleMaps
  const displayedJobs =
    selectedJobTab === "all"
      ? allJobs
      : selectedJobTab === "draft"
        ? draftJobs
        : jobs;
  const markers = displayedJobs
    .filter((job: Job) => job.location?.lat && job.location?.lng)
    .map((job: Job, index: number) => ({
      id: job.id,
      position: {
        lat: job.location.lat,
        lng: job.location.lng,
      },
      description: job.address_formatted || "No address",
      duration: job.service_duration,
      timeWindowStart: job.time_window_start,
      timeWindowEnd: job.time_window_end,
      jobType: job.job_type,
      jobData: job,
      sequenceNumber: index + 1,
    }));

  const columns = [
    ...createJobTableColumns({
      viewColumnRenderer: (params: any) => (
        <Button
          type="link"
          size="small"
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
        >
          Map View
        </Button>
      ),
      teamsMap: getTeamsMap(),
      jobStatus: selectedJobTab === "all" ? undefined : selectedJobTab,
    }),
    createActionsColumn<Job>({
      actions: [
        {
          key: "edit",
          label: "Edit",
          onClick: (job: Job) => setEditJobData(job),
        },
        {
          key: "delete",
          label: "Delete",
          type: "delete",
          onClick: async (job: Job) => {
            await deleteJobAction(job.id);
          },
        },
      ],
      entityName: "Job",
    }),
  ];

  const addJobsMenu: MenuProps["items"] = [
    {
      key: "manual",
      label: "Manually Add Jobs",
      onClick: () => setShowAddJobModal(true),
    },
    {
      key: "bulk",
      label: "Bulk Upload Jobs",
      onClick: () => setShowBulkUploadModal(true),
    },
  ];

  if (error) {
    return <div>Error: {error}</div>;
  }

  const listContent = (
    <div className="flex flex-col h-full">
      <Flex justify="space-between" align="center" className="my-4">
        <Flex gap={24} align="center">
          <Title level={4} className="m-0 pt-2">
            Jobs
          </Title>
          <DraftJobsDatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            draftJobDates={draftJobDates}
            style={{
              visibility: selectedJobTab === "draft" ? "visible" : "hidden",
            }}
          />
        </Flex>

        <Radio.Group
          buttonStyle="solid"
          onChange={handleJobStatusChange}
          value={selectedJobTab}
        >
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="draft">Draft</Radio.Button>
          <Radio.Button value="assigned">Assigned</Radio.Button>
          <Radio.Button value="completed">Completed</Radio.Button>
        </Radio.Group>

        <Flex
          gap={8}
          style={{
            minWidth: 220,
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={() => setIsMapOpen(!isMapOpen)}>
            {isMapOpen ? "Close Map" : "Map View"}
          </Button>
          <Button
            style={{
              visibility:
                selectedJobTab === "all" || selectedJobTab === "draft"
                  ? "visible"
                  : "hidden",
            }}
            danger
            disabled={selectedJobIds.length === 0}
            onClick={handleDeleteJobsRequest}
            icon={<DeleteOutlined style={{ fontSize: 18 }} />}
          />
          <Button
            type="primary"
            disabled={
              selectedJobIds.length === 0 ||
              (selectedJobTab !== "draft" && selectedJobTab !== "all")
            }
            onClick={() => setShowCreateRouteModal(true)}
            style={{
              visibility:
                selectedJobTab === "all" || selectedJobTab === "draft"
                  ? "visible"
                  : "hidden",
            }}
          >
            Create New Route
          </Button>
          <Dropdown
            trigger={["click"]}
            menu={{ items: addJobsMenu }}
            placement="bottomRight"
          >
            <Button>
              Add Jobs <DownOutlined />
            </Button>
          </Dropdown>
        </Flex>
      </Flex>

      <div className="flex-1 min-h-0 mt-2">
        <BaseTable<Job>
          columnDefs={columns}
          rowData={displayedJobs}
          rowSelection="multiple"
          loading={isLoading}
          emptyMessage={
            selectedJobTab === "draft"
              ? "No jobs on the selected date"
              : selectedJobTab === "all"
                ? "No jobs found"
                : "No jobs to show"
          }
          pagination={true}
          containerStyle={{ height: "100%" }}
          onSelectionChanged={(event) => {
            const selectedRows = event.api
              .getSelectedRows()
              .map((row: Job) => row.id);
            setSelectedJobIds(selectedRows);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0">
      {isMapOpen ? (
        <PanelGroup direction="vertical">
          <Panel defaultSize={40} minSize={10}>
            <div className="h-full">
              <GoogleMaps
                markers={markers}
                center={mapCenter || undefined}
                zoom={mapCenter ? 17 : undefined}
                selectedMarkerId={selectedMarkerId}
                onMarkerSelect={setSelectedMarkerId}
                InfoWindowModal={({ marker }) => (
                  <MarkerTooltip
                    jobType={marker.jobType}
                    address={marker.description}
                    duration={marker.duration}
                    timeWindowStart={marker.timeWindowStart}
                    timeWindowEnd={marker.timeWindowEnd}
                    onEdit={() =>
                      setEditJobData((marker.jobData as Job) ?? null)
                    }
                  />
                )}
              />
            </div>
          </Panel>
          <ResizeHandle />
          <Panel defaultSize={60} minSize={5}>
            <div className="pt-2 px-2 h-full">{listContent}</div>
          </Panel>
        </PanelGroup>
      ) : (
        <div className="h-full px-2">{listContent}</div>
      )}

      {/* Edit Job Drawer */}
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

      {showCreateRouteModal &&
        (() => {
          const selectedJobs = displayedJobs.filter((job: Job) =>
            selectedJobIds.includes(job.id),
          );
          const uniqueDates = new Set(
            selectedJobs.map((job: Job) => job.scheduled_date),
          );
          return (
            <CreateRouteModal
              open={showCreateRouteModal}
              setOpen={setShowCreateRouteModal}
              selectedJobIds={selectedJobIds}
              hasMixedDates={uniqueDates.size > 1}
            />
          );
        })()}

      <AddJobsModal
        open={showAddJobModal}
        setOpen={setShowAddJobModal}
        onJobCreated={() => {
          if (selectedJobTab === "all") fetchAllJobs();
          else fetchJobsByStatus(selectedJobTab as JobStatus);
        }}
      />
      <BulkUploadModal
        open={showBulkUploadModal}
        onClose={() => {
          setShowBulkUploadModal(false);
          if (selectedJobTab === "all") fetchAllJobs();
          else fetchJobsByStatus(selectedJobTab as JobStatus);
        }}
      />
    </div>
  );
}
