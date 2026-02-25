import { useState } from "react";
import { Typography, Tag, Button, message } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Job, JobStatus } from "@/types/job.type";
import { STATUS_COLORS } from "@/utils/jobs.utils";
import { markJobCompleted } from "@/apis/jobs.api";
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
}

const RouteInfoWindow: React.FC<RouteInfoWindowProps> = ({ marker }) => {
  const { jobData, title, description } = marker;
  const { patchJobLocally } = useJobsStore();
  const { fetchRoutes, selectedStatus } = useRouteStore();
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  console.log("jobData  -> ", jobData);
  const status = jobData?.status;
  const isCompleted = status === "completed";

  const handleMarkCompleted = async () => {
    if (!jobData?.id) return;

    try {
      setIsMarkingComplete(true);
      const updatedJob = await markJobCompleted(jobData.id);
      // Reflect the update in the store locally to avoid double PUT
      patchJobLocally(updatedJob);
      await fetchRoutes(selectedStatus);
      message.success("Job marked as completed");
    } catch (error) {
      message.error("Failed to mark job as completed");
    } finally {
      setIsMarkingComplete(false);
    }
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
      {jobData && !isCompleted && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            loading={isMarkingComplete}
            onClick={handleMarkCompleted}
            style={{
              width: "100%",
              backgroundColor: "#16a34a",
              borderColor: "#16a34a",
            }}
          >
            Mark as Completed
          </Button>
        </div>
      )}
    </div>
  );
};

export default RouteInfoWindow;
