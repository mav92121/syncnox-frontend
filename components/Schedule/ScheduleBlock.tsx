"use client";

import {
  ScheduleBlock as ScheduleBlockType,
  getBlockColor,
} from "@/types/schedule.type";
import { Tooltip } from "antd";

interface ScheduleBlockProps {
  block: ScheduleBlockType;
  dayStartHour?: number;
  dayEndHour?: number;
  timezone?: string;
}

export default function ScheduleBlock({
  block,
  dayStartHour = 0,
  dayEndHour = 24,
}: ScheduleBlockProps) {
  const startDate = new Date(block.start_time);
  const endDate = new Date(block.end_time);

  const startHour = startDate.getHours() + startDate.getMinutes() / 60;
  const endHour = endDate.getHours() + endDate.getMinutes() / 60;

  const totalHours = dayEndHour - dayStartHour;
  const leftPercent = ((startHour - dayStartHour) / totalHours) * 100;
  const widthPercent = ((endHour - startHour) / totalHours) * 100;

  const clampedLeft = Math.max(0, leftPercent);
  const clampedWidth = Math.min(100 - clampedLeft, widthPercent);

  if (clampedWidth <= 0 || clampedLeft >= 100) {
    return null;
  }

  const backgroundColor = getBlockColor(block);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const tooltipContent = (
    <div>
      <div className="font-semibold">{block.title}</div>
      <div>
        {formatTime(startDate)} - {formatTime(endDate)}
      </div>
      {block.status && (
        <div className="capitalize">
          Status: {block.status.replace("_", " ")}
        </div>
      )}
      {block.metadata?.stops_count !== undefined && (
        <div>Stops: {block.metadata.stops_count}</div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="top">
      <div
        className="absolute top-1 bottom-1 rounded px-1.5 overflow-hidden whitespace-nowrap text-ellipsis text-white text-xs font-medium cursor-pointer shadow-sm flex items-center min-w-[20px]"
        style={{
          left: `${clampedLeft}%`,
          width: `${clampedWidth}%`,
          backgroundColor,
        }}
      >
        <span className="overflow-hidden text-ellipsis">{block.title}</span>
      </div>
    </Tooltip>
  );
}
