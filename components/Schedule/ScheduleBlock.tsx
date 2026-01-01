"use client";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  ScheduleBlock as ScheduleBlockType,
  getBlockColor,
} from "@/types/schedule.type";
import { Tooltip } from "antd";

// Enable dayjs timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

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
  timezone: tz,
}: ScheduleBlockProps) {
  // Use provided timezone or auto-detect from browser
  const effectiveTimezone =
    tz || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Parse times with proper timezone handling
  const startDayjs = dayjs(block.start_time).tz(effectiveTimezone);
  const endDayjs = dayjs(block.end_time).tz(effectiveTimezone);

  // Calculate hours with fractional minutes in the specified timezone
  const startHour = startDayjs.hour() + startDayjs.minute() / 60;
  const endHour = endDayjs.hour() + endDayjs.minute() / 60;

  const totalHours = dayEndHour - dayStartHour;
  const leftPercent = ((startHour - dayStartHour) / totalHours) * 100;
  const widthPercent = ((endHour - startHour) / totalHours) * 100;

  const clampedLeft = Math.max(0, leftPercent);
  const clampedWidth = Math.min(100 - clampedLeft, widthPercent);

  if (clampedWidth <= 0 || clampedLeft >= 100) {
    return null;
  }

  const backgroundColor = getBlockColor(block);

  const formatTime = (date: dayjs.Dayjs) => {
    return date.format("hh:mm A");
  };

  const tooltipContent = (
    <div>
      <div className="font-semibold">{block.title}</div>
      <div>
        {formatTime(startDayjs)} - {formatTime(endDayjs)}
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
