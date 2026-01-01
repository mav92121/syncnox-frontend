"use client";

import { ResourceSchedule } from "@/types/schedule.type";
import ScheduleBlock from "./ScheduleBlock";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface ResourceRowProps {
  resource: ResourceSchedule;
  dayStartHour?: number;
  dayEndHour?: number;
  timezone?: string;
}

export default function ResourceRow({
  resource,
  dayStartHour = 0,
  dayEndHour = 24,
  timezone,
}: ResourceRowProps) {
  const hours = [];
  for (let h = dayStartHour; h < dayEndHour; h++) {
    hours.push(h);
  }

  return (
    <div className="flex border-b border-gray-100 min-h-[48px]">
      {/* Driver name column - sticky */}
      <div className="w-[180px] min-w-[180px] py-2 px-3 border-r border-gray-200 flex items-center gap-2 bg-white sticky left-0 z-[2]">
        <Avatar size="small" icon={<UserOutlined />} />
        <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {resource.resource_name}
        </span>
      </div>

      {/* Timeline area */}
      <div className="flex-1 relative flex">
        {/* Background hour grid */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex-1 min-w-[60px] border-r border-gray-50"
          />
        ))}

        {/* Schedule blocks */}
        {resource.blocks.map((block) => (
          <ScheduleBlock
            key={block.id}
            block={block}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
            timezone={timezone}
          />
        ))}
      </div>
    </div>
  );
}
