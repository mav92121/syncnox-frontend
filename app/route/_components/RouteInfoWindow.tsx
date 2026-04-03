import { useState } from "react";
import { Typography, Tag, Button, message, App } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Job, JobStatus } from "@/types/job.type";
import { STATUS_COLORS } from "@/utils/jobs.utils";
import { updateJobStatus } from "@/apis/jobs.api";
import { useJobsStore } from "@/store/jobs.store";
import { useRouteStore } from "@/store/routes.store";
import { MarkerJobData } from "./optimizationView.utils";

const { Text } = Typography;

interface MarkerData {
  id: string | number;
  position: google.maps.LatLngLiteral;
  title?: string;
  description?: string;
  jobData?: Job | MarkerJobData;
}

interface RouteInfoWindowProps {
  marker: MarkerData;
  onRemoveJob?: () => void;
}

const RouteInfoWindow: React.FC<RouteInfoWindowProps> = ({ marker, onRemoveJob }) => {
  const { jobData, title, description } = marker;
  const { patchJobLocally } = useJobsStore();
  const { modal } = App.useApp();
  const { fetchRoutes, selectedStatus } = useRouteStore();
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const status = jobData?.status;
  const showButtons = status === "completed" || status === "failed";


  const handleUpdateJobStatus = async (status: string) => {
    if (!jobData?.id) return;

    try {
      setIsMarkingComplete(true);
      const updatedJob = await updateJobStatus(jobData.id, status);
      // Reflect the update in the store locally to avoid double PUT
      patchJobLocally(updatedJob);
      await fetchRoutes(selectedStatus);
      message.success(
        status === "completed"
          ? "Job marked as completed"
          : "Job marked as skipped",
      );
    } catch (error) {
      message.error(
        status === "completed"
          ? "Failed to mark job as completed"
          : "Failed to skip job",
      );
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const confirmAction = (status: string) => {
    const isComplete = status === "completed";
    modal.confirm({
      title: isComplete ? "Mark as Completed?" : "Skip this job?",
      content: isComplete
        ? "Are you sure you want to mark this job as completed?"
        : "Are you sure you want to skip this job?",
      okText: isComplete ? "Mark as Completed" : "Skip",
      okType: isComplete ? "primary" : "danger",
      cancelText: "Cancel",
      onOk: () => handleUpdateJobStatus(status),
    });
  };

  return (
    <div className="min-w-[240px] max-w-[320px] bg-white text-gray-800">
      {/* Address */}
      <div className="flex gap-3 mb-3 items-start">
        <EnvironmentOutlined className="text-gray-400 text-lg shrink-0 mt-0.5" />
        <Text className="text-sm text-gray-700 leading-snug font-medium">
          {title || jobData?.address_formatted || "Unknown Address"}
        </Text>
      </div>

      {/* Time & Status Row */}
      <div className="flex justify-between items-center">
        {/* Left: Time Info */}
        <div className="flex gap-3 items-start">
          <ClockCircleOutlined className="text-gray-400 text-lg shrink-0 mt-0.5" />
          <div className="flex flex-col">
            {description && (
              <Text className="text-sm text-gray-900 font-semibold leading-snug">
                {description}
              </Text>
            )}
            {jobData &&
              "time_window_start" in jobData &&
              jobData.time_window_start &&
              "time_window_end" in jobData &&
              jobData.time_window_end && (
                <Text className="text-xs text-gray-500 leading-tight">
                  {jobData.time_window_start} - {jobData.time_window_end}
                </Text>
              )}
          </div>
        </div>

        {/* Right: Status */}
        {status && (
          <Tag
            color={STATUS_COLORS[status]}
            className="mr-0 ml-2 capitalize border-none px-2 py-0.5 text-xs font-semibold rounded-md shrink-0"
          >
            {status.replace("_", " ")}
          </Tag>
        )}
      </div>
      {jobData && !showButtons && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              loading={isMarkingComplete}
              onClick={() => confirmAction("completed")}
              style={{
                width: "100%",
                backgroundColor: "#16a34a",
                borderColor: "#16a34a",
              }}
            >
              Mark as Completed
            </Button>
            <Button
              onClick={() => confirmAction("failed")}
              type="default"
              size="small"
            >
              Skip
            </Button>
          </div>
          {onRemoveJob && (
            <Button
              type="primary"
              danger
              size="small"
              style={{ width: "100%" }}
              onClick={onRemoveJob}
            >
              Remove from Route
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteInfoWindow;
