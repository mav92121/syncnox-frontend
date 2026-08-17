"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Drawer,
  Modal,
  Flex,
  Tag,
  message,
  Dropdown,
  type MenuProps,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  DownOutlined,
  PlusOutlined,
  UploadOutlined,
  FileExcelOutlined
} from "@ant-design/icons";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "@/components/ResizeHandle";
import { useJobsStore } from "@/store/jobs.store";
import { useTransportJobsStore } from "@/store/transportJobs.store";
import { useTeamStore } from "@/store/team.store";
import { ColDef } from "ag-grid-community";
import { Job, JobStatus, JobType } from "@/types/job.type";
import { PickupType, TransportJob } from "@/types/transportJob.type";

type JobTab = "all" | JobStatus;
type JobCategory = "delivery" | "transport";

import BaseTable from "@/components/Table/BaseTable";
import JobForm from "@/components/Jobs/JobForm";
import TransportJobFormModal from "@/components/Jobs/TransportJobFormModal";
import GoogleMaps from "@/components/GoogleMaps";
import MarkerTooltip from "@/components/MarkerTooltip";
import { createJobTableColumns } from "@/utils/jobs.utils";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import CreateRouteModal from "@/app/plan/_components/CreateRouteModal";
import DraftJobsDatePicker from "@/components/Jobs/DraftJobsDatePicker";
import { useIndexStore } from "@/store/index.store";
import AddJobsModal from "@/app/plan/AddJobsModal";
import BulkUploadModal from "@/components/BulkUploadModal";
import TransportImportModal from "@/components/TransportImportModal";

const { Title } = Typography;

export default function JobsList() {
  const {
    jobs,
    draftJobs,
    allJobs,
    isLoading: isJobsLoading,
    error: jobsError,
    deleteJobAction,
    deleteJobsAction,
    fetchJobsByStatus,
    fetchAllJobs,
    resetAllJobs,
    selectedDate,
    setSelectedDate,
    draftJobDates,
  } = useJobsStore();

  const {
    transportJobs,
    transportJobDates,
    isLoading: isTransportLoading,
    error: transportError,
    fetchTransportJobs,
    deleteTransportJobAction,
    deleteTransportJobsAction,
  } = useTransportJobsStore();

  const { setCurrentTab } = useIndexStore();
  const { getTeamsMap } = useTeamStore();

  // Category & Tab selection
  const [jobCategory, setJobCategory] = useState<JobCategory>("delivery");
  const [selectedJobTab, setSelectedJobTab] = useState<JobTab>("draft");

  // Selection & Modals
  const [editJobData, setEditJobData] = useState<Job | null>(null);
  const [editTransportJobData, setEditTransportJobData] = useState<TransportJob | null>(null);
  const [showAddTransportModal, setShowAddTransportModal] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);

  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showTransportImportModal, setShowTransportImportModal] = useState(false);

  // Map state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | string | null>(null);

  // Remember category preference in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("syncnox_job_category") as JobCategory | null;
    if (saved === "delivery" || saved === "transport") {
      setJobCategory(saved);
    }
  }, []);

  const handleCategoryChange = (category: JobCategory) => {
    setJobCategory(category);
    setSelectedJobIds([]);
    localStorage.setItem("syncnox_job_category", category);
    if (category === "transport") {
      fetchTransportJobs(selectedDate ?? undefined);
    }
  };

  useEffect(() => {
    if (jobCategory === "transport") {
      fetchTransportJobs(selectedDate ?? undefined);
    }
  }, [selectedDate, jobCategory, fetchTransportJobs]);

  const handleDeleteJobsRequest = () => {
    if (selectedJobIds.length === 0) return;

    const count = selectedJobIds.length;
    const isTransport = jobCategory === "transport";

    Modal.confirm({
      title: isTransport ? "Delete Transport Jobs" : "Delete Jobs",
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete ${count} selected ${isTransport ? "transport" : ""} job(s)?`,
      okText: "Delete",
      okType: "danger",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          if (isTransport) {
            await deleteTransportJobsAction(selectedJobIds);
          } else {
            await deleteJobsAction(selectedJobIds, "draft");
          }
          message.success(`Successfully deleted ${count} job(s)`);
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
    if (jobCategory === "delivery") {
      if (value === "all") {
        fetchAllJobs();
      } else {
        fetchJobsByStatus(value as JobStatus);
      }
    }
  };

  useEffect(() => {
    return () => {
      resetAllJobs();
    };
  }, [resetAllJobs]);

  // Transformed jobs & map markers
  const displayedDeliveryJobs =
    selectedJobTab === "all"
      ? allJobs
      : selectedJobTab === "draft"
      ? draftJobs
      : jobs;

  const deliveryMarkers = displayedDeliveryJobs
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

  const transportMarkers = transportJobs
    .filter((j) => (j.go_pickup_latitude && j.go_pickup_longitude) || (j.client_latitude && j.client_longitude))
    .map((j, index) => ({
      id: `transport-${j.id}`,
      position: {
        lat: j.go_pickup_latitude || j.client_latitude || 0,
        lng: j.go_pickup_longitude || j.client_longitude || 0,
      },
      description: `${j.candidate_name} (${j.client_name})`,
      duration: 0,
      timeWindowStart: j.start_hour,
      timeWindowEnd: j.end_hour,
      jobType: "transport" as JobType,
      jobData: j,
      sequenceNumber: index + 1,
    }));

  const activeMarkers = jobCategory === "transport" ? transportMarkers : deliveryMarkers;

  // Delivery Table Columns
  const deliveryColumns = [
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

  // Dedicated Transport Table Columns
  const transportColumns: ColDef<TransportJob>[] = [
    {
      headerName: "Quart / Shift",
      field: "quart_id",
      width: 120,
      valueGetter: (params: any) => params.data?.quart_id || "-",
    },
    {
      headerName: "Candidate / Passenger",
      field: "candidate_name",
      width: 220,
      cellRenderer: (params: any) => {
        const j: TransportJob = params.data;
        if (!j) return null;
        return (
          <div className="flex flex-col justify-center h-full py-0.5 leading-snug">
            <span className="font-semibold text-gray-900 text-xs truncate" title={j.candidate_name}>
              {j.candidate_name}
            </span>
            {j.candidate_phone && (
              <span className="text-[11px] text-gray-500 truncate" title={j.candidate_phone}>
                {j.candidate_phone}
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Client / Company",
      field: "client_name",
      width: 220,
      cellRenderer: (params: any) => {
        const j: TransportJob = params.data;
        if (!j) return null;
        return (
          <div className="flex flex-col justify-center h-full py-0.5 leading-snug">
            <span className="font-semibold text-gray-900 text-xs truncate" title={j.client_name}>
              {j.client_name}
            </span>
            {j.client_address && (
              <span className="text-[11px] text-gray-500 truncate" title={j.client_address}>
                {j.client_address}
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Pickup Type",
      field: "pickup_type",
      width: 130,
      cellRenderer: (params: any) => {
        const type: PickupType = params.data?.pickup_type;
        if (type === "one_way") {
          return <Tag color="purple" className="text-xs rounded-none border-purple-200">One-way (go)</Tag>;
        }
        if (type === "return_only") {
          return <Tag color="orange" className="text-xs rounded-none border-orange-200">Return only</Tag>;
        }
        return <Tag color="blue" className="text-xs rounded-none border-blue-200">Round trip</Tag>;
      },
    },
    {
      headerName: "Shift Hours",
      field: "start_hour",
      width: 140,
      valueGetter: (params: any) => {
        const j: TransportJob = params.data;
        const start = j.start_hour ? j.start_hour.substring(0, 5) : "";
        const end = j.end_hour ? j.end_hour.substring(0, 5) : "";
        return `${start} - ${end}`;
      },
    },
    {
      headerName: "Go Pick-up Point",
      field: "go_pickup_point",
      width: 220,
      valueGetter: (params: any) => params.data?.go_pickup_point || params.data?.candidate_address || "-",
    },
    {
      headerName: "Return Drop-off Point",
      field: "return_dropoff_point",
      width: 220,
      valueGetter: (params: any) => params.data?.return_dropoff_point || params.data?.candidate_address || "-",
    },
    createActionsColumn<TransportJob>({
      actions: [
        {
          key: "edit",
          label: "Edit",
          onClick: (job: TransportJob) => setEditTransportJobData(job),
        },
        {
          key: "delete",
          label: "Delete",
          type: "delete",
          onClick: async (job: TransportJob) => {
            await deleteTransportJobAction(job.id);
            message.success("Transport job deleted");
          },
        },
      ],
      entityName: "Transport Job",
    }),
  ];

  // Add Jobs Menu Options
  const addJobsMenu: MenuProps["items"] = [
    {
      key: "group_delivery",
      type: "group",
      label: (
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
          Delivery Jobs
        </span>
      ),
      children: [
        {
          key: "manual_delivery",
          icon: <PlusOutlined className="text-gray-500" />,
          label: <span className="font-medium text-xs text-gray-800">Add Delivery Job</span>,
          onClick: () => setShowAddJobModal(true),
        },
        {
          key: "bulk_delivery",
          icon: <UploadOutlined className="text-gray-500" />,
          label: <span className="font-medium text-xs text-gray-800">Bulk Upload Delivery Jobs</span>,
          onClick: () => setShowBulkUploadModal(true),
        },
      ],
    },
    {
      type: "divider",
    },
    {
      key: "group_transport",
      type: "group",
      label: (
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
          Transport Jobs
        </span>
      ),
      children: [
        {
          key: "manual_transport",
          icon: <PlusOutlined className="text-emerald-700" />,
          label: <span className="font-medium text-xs text-gray-800">Add Transport Job</span>,
          onClick: () => {
            setEditTransportJobData(null);
            setShowAddTransportModal(true);
          },
        },
        {
          key: "import_transport",
          icon: <FileExcelOutlined className="text-emerald-700" />,
          label: <span className="font-medium text-xs text-gray-800">Import Transport Jobs (Excel)</span>,
          onClick: () => setShowTransportImportModal(true),
        },
      ],
    },
  ];

  const activeError = jobCategory === "transport" ? transportError : jobsError;

  if (activeError) {
    return <div className="p-4 text-red-600 font-semibold">Error: {activeError}</div>;
  }

  const listContent = (
    <div className="flex flex-col h-full">
      <Flex justify="space-between" align="center" className="my-3">
        {/* Left Section: Title + Job Category Switcher + Date Picker */}
        <Flex gap={16} align="center" className="shrink-0">
          <Title level={4} className="m-0 pt-1 shrink-0 whitespace-nowrap">
            Jobs
          </Title>

          {/* Job Category Switcher (Delivery vs Transport) */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-none border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => handleCategoryChange("delivery")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all select-none cursor-pointer border-none outline-none ${
                jobCategory === "delivery"
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800 bg-transparent"
              }`}
            >
              <span>Delivery Jobs</span>
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange("transport")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all select-none cursor-pointer border-none outline-none ${
                jobCategory === "transport"
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800 bg-transparent"
              }`}
            >
              <span>Transport Jobs</span>
            </button>
          </div>

          {/* Date Picker */}
          <DraftJobsDatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            draftJobDates={jobCategory === "transport" ? transportJobDates : draftJobDates}
            style={{
              visibility:
                jobCategory === "transport" || selectedJobTab === "draft"
                  ? "visible"
                  : "hidden",
            }}
          />
        </Flex>

        {/* Center: Delivery Job Status Tabs (Only shown for Delivery category) */}
        {jobCategory === "delivery" && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-none">
            {([
              { value: "draft", label: "Draft", dot: "bg-gray-400" },
              { value: "assigned", label: "Assigned", dot: "bg-blue-500" },
              { value: "completed", label: "Completed", dot: "bg-emerald-500" },
              { value: "all", label: "All", dot: "" },
            ] as const).map(({ value, label, dot }) => (
              <button
                key={value}
                onClick={() => handleJobStatusChange({ target: { value } })}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-none text-sm font-medium transition-all duration-150 select-none cursor-pointer border-none outline-none ${
                  selectedJobTab === value
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-700 bg-transparent"
                }`}
              >
                {dot && <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${dot}`} />}
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Right Section: Action Buttons */}
        <Flex gap={8} justify="flex-end" style={{ minWidth: 220 }}>
          {jobCategory === "delivery" && (
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
          )}

          <Button
            danger
            disabled={selectedJobIds.length === 0}
            onClick={handleDeleteJobsRequest}
            icon={<DeleteOutlined style={{ fontSize: 18 }} />}
          />
          <Button onClick={() => setIsMapOpen(!isMapOpen)}>
            {isMapOpen ? "Close Map" : "Map View"}
          </Button>
          <Dropdown trigger={["click"]} menu={{ items: addJobsMenu }} placement="bottomRight">
            <Button type="primary">
              Add Jobs <DownOutlined />
            </Button>
          </Dropdown>
        </Flex>
      </Flex>

      {/* Main Table View */}
      <div className="flex-1 min-h-0 mt-2">
        {jobCategory === "delivery" ? (
          <BaseTable<Job>
            columnDefs={deliveryColumns}
            rowData={displayedDeliveryJobs}
            rowSelection="multiple"
            loading={isJobsLoading}
            emptyMessage={
              selectedJobTab === "draft"
                ? "No delivery jobs on the selected date"
                : selectedJobTab === "all"
                ? "No delivery jobs found"
                : "No delivery jobs to show"
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
        ) : (
          <BaseTable<TransportJob>
            columnDefs={transportColumns}
            rowData={transportJobs}
            rowSelection="multiple"
            loading={isTransportLoading}
            emptyMessage="No transport jobs on the selected date"
            pagination={true}
            rowHeight={48}
            containerStyle={{ height: "100%" }}
            onSelectionChanged={(event) => {
              const selectedRows = event.api
                .getSelectedRows()
                .map((row: TransportJob) => row.id);
              setSelectedJobIds(selectedRows);
            }}
          />
        )}
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
                markers={activeMarkers}
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
                    onEdit={() => {
                      if (jobCategory === "delivery") {
                        setEditJobData((marker.jobData as Job) ?? null);
                      } else {
                        setEditTransportJobData((marker.jobData as unknown as TransportJob) ?? null);
                        setShowAddTransportModal(true);
                      }
                    }}
                  />
                )}
              />
            </div>
          </Panel>
          <ResizeHandle />
          <Panel defaultSize={60} minSize={5}>
            <div className="pt-2 h-full">{listContent}</div>
          </Panel>
        </PanelGroup>
      ) : (
        <div className="h-full">{listContent}</div>
      )}

      {/* Edit Delivery Job Drawer */}
      <Drawer
        onClose={() => setEditJobData(null)}
        title="Edit Delivery Job"
        open={editJobData?.id !== undefined}
        size="large"
        placement="right"
      >
        <JobForm onSubmit={() => setEditJobData(null)} initialData={editJobData} />
      </Drawer>

      {/* Transport Job Form Modal (Manual Create / Edit) */}
      <TransportJobFormModal
        open={showAddTransportModal || editTransportJobData !== null}
        onClose={() => {
          setShowAddTransportModal(false);
          setEditTransportJobData(null);
        }}
        initialValues={editTransportJobData}
      />

      {showCreateRouteModal &&
        (() => {
          const selectedJobs = displayedDeliveryJobs.filter((job: Job) =>
            selectedJobIds.includes(job.id)
          );
          const uniqueDates = new Set(selectedJobs.map((job: Job) => job.scheduled_date));
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
      <TransportImportModal
        open={showTransportImportModal}
        onClose={() => setShowTransportImportModal(false)}
        onSuccess={() => {
          if (jobCategory === "transport") {
            fetchTransportJobs(selectedDate ?? undefined);
          } else if (selectedJobTab === "all") {
            fetchAllJobs();
          } else {
            fetchJobsByStatus(selectedJobTab as JobStatus);
          }
        }}
      />
    </div>
  );
}
