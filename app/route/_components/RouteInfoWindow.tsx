import { Typography, Tag } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Job, JobStatus } from "@/types/job.type";
import { STATUS_COLORS } from "@/utils/jobs.utils";

const { Text } = Typography;

interface MarkerData {
  id: string | number;
  position: google.maps.LatLngLiteral;
  title?: string;
  description?: string;
  jobData?: Job;
}

interface RouteInfoWindowProps {
  marker: MarkerData;
}

const RouteInfoWindow: React.FC<RouteInfoWindowProps> = ({ marker }) => {
  const { jobData, title, description } = marker;

  const status = jobData?.status;

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
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
        {/* Left: Time Info */}
        <div className="flex gap-3 items-start">
          <ClockCircleOutlined className="text-gray-400 text-lg shrink-0 mt-0.5" />
          <div className="flex flex-col">
            {description && (
              <Text className="text-sm text-gray-900 font-semibold leading-snug">
                {description}
              </Text>
            )}
            {jobData?.time_window_start && jobData?.time_window_end && (
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
    </div>
  );
};

export default RouteInfoWindow;
