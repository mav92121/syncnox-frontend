"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Typography, Button, Drawer, Modal, Flex, Radio } from "antd";
import { useJobsStore } from "@/zustand/jobs.store";
import { useTeamStore } from "@/zustand/team.store";
import { useIndexStore } from "@/zustand/index.store";
import { Job, JobStatus } from "@/types/job.type";
import BaseTable from "@/components/Table/BaseTable";
import JobForm from "@/components/Jobs/JobForm";
import GoogleMaps from "@/components/GoogleMaps";
import MarkerTooltip from "@/components/MarkerTooltip";
import { createJobTableColumns } from "@/utils/jobs.utils";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import CreateRouteModal from "@/app/plan/_components/CreateRouteModal";

const { Title } = Typography;

export default function JobsList() {
  const {
    jobs,
    isLoading,
    error,
    deleteJobAction,
    fetchJobsByStatus,
    resetAllJobs,
  } = useJobsStore();
  const { getTeamsMap } = useTeamStore();
  const { setCurrentTab } = useIndexStore();
  const [editJobData, setEditJobData] = useState<Job | null>(null);
  const [mapViewJob, setMapViewJob] = useState<Job | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [selectedJobStatus, setSelectedJobStatus] = useState("draft");
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);

  const handleJobStatusChange = (e: any) => {
    setSelectedJobStatus(e.target.value);
    fetchJobsByStatus(e.target.value as JobStatus);
  };

  useEffect(() => {
    return () => {
      resetAllJobs();
    };
  }, []);

  // Transform jobs into markers for GoogleMaps
  const markers = jobs
    .filter((job) => job.location?.lat && job.location?.lng)
    .map((job, index) => ({
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
              setMapViewJob(params.data);
            }
          }}
        >
          Map View
        </Button>
      ),
      teamsMap: getTeamsMap(),
      jobStatus: selectedJobStatus,
    }),
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
    <div className="flex flex-col h-full relative top-[-8px]">
      <Flex justify="space-between" align="center">
        <Title level={5} className="m-0 pt-2">
          Jobs
        </Title>
        <Radio.Group
          onChange={handleJobStatusChange}
          value={selectedJobStatus}
          size="small"
        >
          <Radio.Button value="draft">Draft</Radio.Button>
          <Radio.Button value="assigned">Assigned</Radio.Button>
          <Radio.Button value="completed">Completed</Radio.Button>
        </Radio.Group>
        <Button
          className={selectedJobStatus !== "draft" ? "invisible" : ""}
          disabled={selectedJobIds.length === 0}
          type="primary"
          size="small"
          onClick={() => setShowCreateRouteModal(true)}
        >
          Create New Route
        </Button>
      </Flex>

      <div className="flex-1 min-h-0">
        <BaseTable<Job>
          columnDefs={columns}
          rowData={jobs}
          rowSelection="multiple"
          loading={isLoading}
          emptyMessage="No jobs to show"
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

      {showCreateRouteModal && (
        <CreateRouteModal
          open={showCreateRouteModal}
          setOpen={setShowCreateRouteModal}
          selectedJobIds={selectedJobIds}
        />
      )}

      {/* Map View Modal */}
      <Modal
        title="Job Location"
        open={mapViewJob !== null}
        onCancel={() => setMapViewJob(null)}
        footer={null}
        width={800}
        centered
        styles={{ body: { height: "500px", padding: 0 } }}
      >
        {mapViewJob && (
          <GoogleMaps
            markers={markers}
            center={{
              lat: mapViewJob.location.lat,
              lng: mapViewJob.location.lng,
            }}
            zoom={17}
            selectedMarkerId={mapViewJob.id}
            onMarkerSelect={(id) => {
              // Find and set the new job when marker is clicked
              const selectedJob = jobs.find((job) => job.id === id);
              if (selectedJob) {
                setMapViewJob(selectedJob);
              }
            }}
            InfoWindowModal={({ marker }) => (
              <MarkerTooltip
                jobType={marker.jobType}
                address={marker.description}
                duration={marker.duration}
                timeWindowStart={marker.timeWindowStart}
                timeWindowEnd={marker.timeWindowEnd}
                onEdit={() => {
                  setEditJobData(marker.jobData ?? null);
                  setMapViewJob(null); // Close map modal when editing
                }}
              />
            )}
          />
        )}
      </Modal>

      <div className="pt-2">
        <Link href="/plan" onClick={() => setCurrentTab("add-jobs")}>
          <Button type="primary" block size="middle">
            Add Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
