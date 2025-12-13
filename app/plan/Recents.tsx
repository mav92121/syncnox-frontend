import { useState } from "react";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import BaseTable from "@/components/Table/BaseTable";
import GoogleMaps from "@/components/GoogleMaps";
import MarkerTooltip from "@/components/MarkerTooltip";
import { Job } from "@/types/job.type";
import { createJobTableColumns } from "@/utils/jobs.utils";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import { useJobsStore } from "@/zustand/jobs.store";
import { useIndexStore } from "@/zustand/index.store";
import { useTeamStore } from "@/zustand/team.store";
import { Button, Typography, Drawer, Flex } from "antd";
import { GripHorizontal } from "lucide-react";
import JobForm from "@/components/Jobs/JobForm";
import CreateRouteModal from "./_components/CreateRouteModal";

const { Title } = Typography;

const Recents = () => {
  const { draftJobs, deleteJobAction, isLoading, error } = useJobsStore();
  const { getTeamsMap } = useTeamStore();
  const { setCurrentTab } = useIndexStore();
  const [editJobData, setEditJobData] = useState<Job | null>(null);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    number | string | null
  >(null);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);

  // Transform draftJobs into markers for GoogleMaps
  const markers = draftJobs
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
      jobData: job, // Store full job data for edit functionality
      sequenceNumber: index + 1, // Sequence number for marker label (1, 2, 3...)
    }));

  const columns = [
    ...createJobTableColumns({
      viewColumnRenderer: (params: any) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            if (params.data.location?.lat && params.data.location?.lng) {
              setMapCenter({
                lat: params.data.location.lat,
                lng: params.data.location.lng,
              });
              // Auto-open tooltip when Map View is clicked
              setSelectedMarkerId(params.data.id);
            }
          }}
        >
          Map View
        </Button>
      ),
      teamsMap: getTeamsMap(),
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
    <div className="absolute inset-0">
      <PanelGroup direction="vertical">
        {/* Map Panel - Resizable */}
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
                  onEdit={() => setEditJobData(marker.jobData ?? null)}
                />
              )}
            />
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="relative h-1 bg-gray-300 hover:bg-blue-500 transition-colors cursor-ns-resize flex items-center justify-center group">
          <div className="absolute flex items-center justify-center">
            <GripHorizontal
              size={20}
              className="text-gray-500 group-hover:text-black transition-colors"
            />
          </div>
        </PanelResizeHandle>

        {/* Jobs Section Panel */}
        <Panel defaultSize={60} minSize={5}>
          <div className="flex flex-col h-full">
            <Flex justify="space-between" align="center">
              <Title level={5} className="m-0 mb-2 pt-2">
                Jobs
              </Title>
              <div className="flex gap-2">
                <Link href="/plan" onClick={() => setCurrentTab("plan")}>
                  <Button block size="small">
                    Add More Jobs
                  </Button>
                </Link>
                <Button
                  disabled={selectedJobIds.length === 0}
                  type="primary"
                  block
                  size="small"
                  onClick={() => setShowCreateRouteModal(true)}
                >
                  Create New Route
                </Button>
              </div>
            </Flex>

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
                onSelectionChanged={(event) => {
                  const selectedRows = event.api
                    .getSelectedRows()
                    .map((row: Job) => row.id);
                  setSelectedJobIds(selectedRows);
                }}
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
            {showCreateRouteModal && (
              <CreateRouteModal
                open={showCreateRouteModal}
                setOpen={setShowCreateRouteModal}
                selectedJobIds={selectedJobIds}
              />
            )}

            {/* Add Job Button */}
            {/* <div>
              <Link href="/plan" onClick={() => setCurrentTab("plan")}>
                <Button type="primary" block size="middle">
                  Add More Jobs
                </Button>
              </Link>
            </div> */}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default Recents;
