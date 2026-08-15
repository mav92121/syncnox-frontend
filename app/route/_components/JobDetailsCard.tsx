import React, { useState } from "react";
import { Tag, Typography, Button, App, message } from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Job, JobStatus } from "@/types/job.type";
import { STATUS_COLORS } from "@/utils/jobs.utils";
import { updateJobStatus } from "@/apis/jobs.api";
import { useJobsStore } from "@/store/jobs.store";
import { useRouteStore } from "@/store/routes.store";

const { Text } = Typography;

interface JobDetailsCardProps {
  stopData: any | null;
  job: Job | null;
  stopIndex?: number;
  driverName?: string;
  onClose: () => void;
  onRemoveJob?: () => void;
}

const JobDetailsCard: React.FC<JobDetailsCardProps> = ({
  stopData,
  job,
  stopIndex = 0,
  driverName,
  onClose,
  onRemoveJob,
}) => {
  const { patchJobLocally } = useJobsStore();
  const { modal } = App.useApp();
  const { fetchRoutes, selectedStatus } = useRouteStore();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!stopData && !job) return null;

  const jobId = job?.id || stopData?.job_id;
  const address =
    job?.address_formatted ||
    stopData?.address_formatted ||
    "Address not specified";
  const status = job?.status || stopData?.status || "assigned";
  const priority =
    job?.priority_level || (job as any)?.priority || "medium";

  const arrivalTime = stopData?.arrival_time
    ? dayjs(stopData.arrival_time).format("hh:mm A")
    : "--:--";
  const serviceDuration =
    stopData?.service_duration_minutes || job?.service_duration || 0;

  const customerName =
    job?.first_name || job?.last_name
      ? `${job.first_name || ""} ${job.last_name || ""}`.trim()
      : (job as any)?.customer_name || "-";
  const phone = job?.phone_number || (job as any)?.customer_phone || "-";
  const email = job?.email || (job as any)?.customer_email || "-";
  const companyName = job?.business_name || "-";
  const notes = job?.additional_notes || (job as any)?.notes || "-";
  const timeWindow =
    job?.time_window_start && job?.time_window_end
      ? `${job.time_window_start} - ${job.time_window_end}`
      : "-";

  const driverLabel = driverName
    ? driverName.split(" ")[0].toUpperCase()
    : "DR1";

  const handleUpdateStatus = async (newStatus: string) => {
    if (!jobId) return;

    const isComplete = newStatus === "completed";
    modal.confirm({
      title: isComplete ? "Mark Job as Completed?" : "Skip this Job?",
      content: isComplete
        ? `Are you sure you want to mark Job #${jobId} as completed?`
        : `Are you sure you want to skip Job #${jobId}?`,
      okText: isComplete ? "Mark Completed" : "Skip Job",
      okType: isComplete ? "primary" : "danger",
      onOk: async () => {
        try {
          setIsUpdating(true);
          const updated = await updateJobStatus(jobId, newStatus);
          patchJobLocally(updated);
          await fetchRoutes(selectedStatus);
          message.success(
            isComplete ? "Job marked as completed" : "Job skipped",
          );
          onClose();
        } catch (err) {
          message.error("Failed to update job status");
        } finally {
          setIsUpdating(false);
        }
      },
    });
  };

  return (
    <div className="absolute top-3 right-3 z-50 w-84 h-[calc(75%-24px)] max-h-[580px] bg-white rounded-xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden text-xs transition-all animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div className="font-bold text-gray-900 text-sm">
          {stopData?.stop_type === "depot"
            ? "Depot Station"
            : `Stop No - ${stopIndex + 1} (${driverLabel})`}
        </div>
        <div className="flex items-center gap-2">
          {onRemoveJob && stopData?.stop_type !== "depot" && (
            <button
              onClick={onRemoveJob}
              title="Remove from Route"
              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
            >
              <DeleteOutlined className="text-sm" />
            </button>
          )}
          <button
            onClick={onClose}
            title="Close"
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer"
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>
      </div>

      {/* Scrollable Key-Value Grid */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {/* Row 1: Contact Name & Status */}
        <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2.5">
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Contact Name
            </div>
            <div className="text-xs text-gray-600 font-medium truncate">
              {customerName}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Status
            </div>
            <div>
              <Tag
                color={STATUS_COLORS[status as JobStatus] || "blue"}
                className="capitalize font-semibold border-none text-[10px] px-1.5 py-0 m-0"
              >
                {(status || "assigned").replace("_", " ")}
              </Tag>
            </div>
          </div>
        </div>

        {/* Row 2: Destination Address & ETA */}
        <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2.5">
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Address
            </div>
            <div className="text-xs text-gray-600 font-medium leading-snug line-clamp-2">
              {address}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              ETA / Arrival
            </div>
            <div className="text-xs text-gray-900 font-bold">{arrivalTime}</div>
          </div>
        </div>

        {/* Row 3: Company Name & Phone */}
        <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2.5">
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Company Name
            </div>
            <div className="text-xs text-gray-600 font-medium truncate">
              {companyName}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Phone
            </div>
            <div className="text-xs text-gray-600 font-medium truncate">
              {phone}
            </div>
          </div>
        </div>

        {/* Row 4: Email & Priority */}
        <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2.5">
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Email
            </div>
            <div className="text-xs text-gray-600 font-medium truncate">
              {email}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Priority
            </div>
            <div className="text-xs font-semibold capitalize text-gray-800">
              {priority}
            </div>
          </div>
        </div>

        {/* Row 5: Time Window & Service Duration */}
        <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2.5">
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Time Window
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {timeWindow}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-700 mb-0.5">
              Service Duration
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {serviceDuration} min
            </div>
          </div>
        </div>

        {/* Row 6: Notes */}
        <div>
          <div className="text-[11px] font-bold text-gray-700 mb-0.5">
            Notes
          </div>
          <div className="text-xs text-gray-600 leading-relaxed break-words bg-gray-50 p-2 border border-gray-200/60 rounded">
            {notes}
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      {stopData?.stop_type !== "depot" && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 shrink-0">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            loading={isUpdating}
            disabled={status === "completed"}
            onClick={() => handleUpdateStatus("completed")}
            className="w-1/2 bg-[#003220] hover:bg-[#002417] text-xs font-semibold"
          >
            Mark Completed
          </Button>
          <Button
            type="default"
            size="small"
            disabled={status === "skipped" || status === "failed"}
            onClick={() => handleUpdateStatus("failed")}
            className="w-1/2 text-xs"
          >
            Skip Stop
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobDetailsCard;
