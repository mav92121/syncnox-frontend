"use client";

import { ResourceSchedule } from "@/types/schedule.type";
import TimelineHeader from "./TimelineHeader";
import ResourceRow from "./ResourceRow";
import { Empty } from "antd";

interface ScheduleTimelineProps {
  resources: ResourceSchedule[];
  dayStartHour?: number;
  dayEndHour?: number;
  timezone?: string;
  loading?: boolean;
}

export default function ScheduleTimeline({
  resources,
  dayStartHour = 0,
  dayEndHour = 24,
  timezone,
  loading = false,
}: ScheduleTimelineProps) {
  const effectiveTimezone =
    timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!loading && resources.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] border border-gray-200 rounded-lg bg-gray-50">
        <Empty description="No drivers scheduled for this date" />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 overflow-hidden bg-white h-full">
      {/* Scrollable container */}
      <div className="custom-scrollbar overflow-x-auto overflow-y-auto max-h-[calc(100vh-125px)]">
        {/* Fixed header + scrollable body */}
        <div className="min-w-[1700px]">
          <TimelineHeader dayStartHour={dayStartHour} dayEndHour={dayEndHour} />

          {/* Resource rows */}
          <div>
            {resources.map((resource) => (
              <ResourceRow
                key={resource.resource_id}
                resource={resource}
                dayStartHour={dayStartHour}
                dayEndHour={dayEndHour}
                timezone={effectiveTimezone}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
