import React, { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import type { Job } from "@/types/job.type";
import { Avatar, Tooltip, Select, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  HomeFilled,
  MoreOutlined,
  PlusOutlined,
  SwapOutlined,
  RetweetOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  calculateTimeRange,
  generateTimeMarkers,
  getPosition,
  getPixelsPerMinute,
  ROW_HEIGHT,
  HEADER_HEIGHT,
  getRouteColor,
} from "@/utils/timeline.utils";

interface TimelineViewProps {
  routes: any[];
  jobs?: Job[];
  onStopClick?: (stop: any, routeIndex: number, stopIndex: number) => void;
  onAddStop?: (routeIndex: number) => void;
  onSwapDriver?: (routeIndex: number) => void;
  onReverseRoute?: (routeIndex: number) => void;
  onReOptimize?: (routeIndex: number) => void;
}

const INTERVAL_OPTIONS = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 25, label: "25 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "60 min" },
];

const formatDurationSeconds = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes} min`;
  }
};

const getRouteDurationStr = (route: any): string => {
  if (route.total_duration_seconds && route.total_duration_seconds > 0) {
    return formatDurationSeconds(route.total_duration_seconds);
  }
  if (route.stops && route.stops.length > 0) {
    const firstStop = route.stops[0];
    const lastStop = route.stops[route.stops.length - 1];
    if (firstStop?.arrival_time && lastStop?.arrival_time) {
      const start = dayjs(firstStop.arrival_time);
      const end = dayjs(lastStop.arrival_time);
      const lastService = lastStop.service_duration_minutes || 0;
      const diffMins = end.diff(start, "minute") + lastService;
      if (diffMins > 0) {
        return formatDurationSeconds(diffMins * 60);
      }
    }
  }
  return "";
};

const DRIVER_COLUMN_WIDTH = 265;

const TimelineView: React.FC<TimelineViewProps> = ({
  routes,
  jobs = [],
  onStopClick,
  onAddStop,
  onSwapDriver,
  onReverseRoute,
  onReOptimize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [intervalMinutes, setIntervalMinutes] = useState(30);

  const { startTime, endTime } = useMemo(
    () => calculateTimeRange(routes),
    [routes],
  );

  const jobsMap = useMemo(() => {
    const map = new Map<number, string>();
    jobs.forEach(job => map.set(Number(job.id), job.status));
    return map;
  }, [jobs]);

  // Dynamic pixels per minute based on interval - smaller intervals get more spread
  const pixelsPerMinute = getPixelsPerMinute(intervalMinutes);

  const totalDurationMinutes = endTime.diff(startTime, "minute");
  const timelineWidth = totalDurationMinutes * pixelsPerMinute;
  const timeMarkers = useMemo(
    () =>
      generateTimeMarkers(startTime, endTime, intervalMinutes, pixelsPerMinute),
    [startTime, endTime, intervalMinutes, pixelsPerMinute],
  );

  const getRouteMenuItems = (routeIndex: number): MenuProps["items"] => [
    {
      key: "add-stop",
      icon: <PlusOutlined />,
      label: "Add Job",
      onClick: () => onAddStop?.(routeIndex),
    },
    {
      key: "swap-driver",
      icon: <SwapOutlined />,
      label: "Swap Route with Driver",
      onClick: () => onSwapDriver?.(routeIndex),
    },
    { type: "divider" as const },
    {
      key: "re-optimize",
      icon: <ThunderboltOutlined />,
      label: "Re-optimize",
      onClick: () => onReOptimize?.(routeIndex),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <div
        className="flex-1 overflow-auto relative custom-scrollbar"
        ref={containerRef}
      >
        <div className="min-w-full inline-block">
          {/* Header Row */}
          <div
            className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200 flex"
            style={{ height: HEADER_HEIGHT, minWidth: "100%" }}
          >
            {/* Sticky Driver Column Header */}
            <div
              className="sticky left-0 z-30 bg-gray-50 border-r border-gray-200 px-3 flex items-center justify-between font-medium text-gray-500 shadow-sm"
              style={{ width: DRIVER_COLUMN_WIDTH, minWidth: DRIVER_COLUMN_WIDTH }}
            >
              <span className="text-xs font-semibold text-gray-600">Driver</span>
              <Select
                value={intervalMinutes}
                onChange={setIntervalMinutes}
                options={INTERVAL_OPTIONS}
                size="small"
                style={{ width: 85 }}
                className="text-xs"
              />
            </div>

            {/* Time Axis */}
            <div className="relative" style={{ width: timelineWidth }}>
              {timeMarkers.map((marker, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-gray-200 pl-1 text-xs text-gray-400"
                  style={{ left: marker.position, height: "100%" }}
                >
                  {marker.label}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="relative">
            {/* Vertical Grid Lines (Background) */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{ marginLeft: DRIVER_COLUMN_WIDTH, width: timelineWidth }}
            >
              {timeMarkers.map((marker, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-dashed border-gray-200"
                  style={{ left: marker.position }}
                />
              ))}
            </div>

            {routes.map((route, routeIndex) => {
              const routeColor = getRouteColor(routeIndex);
              const durationStr = getRouteDurationStr(route);
              const totalStopsCount = route.stops?.length || 0;

              return (
                <div
                  key={routeIndex}
                  className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Sticky Driver Info */}
                  <div
                    className="sticky left-0 z-10 bg-white border-r border-gray-200 px-3 flex items-center gap-2.5 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]"
                    style={{ width: DRIVER_COLUMN_WIDTH, minWidth: DRIVER_COLUMN_WIDTH }}
                  >
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: routeColor }}
                      className="text-white shrink-0"
                      size="default"
                    />
                    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                      <span className="font-semibold truncate text-gray-800 text-xs">
                        {route.team_member_name ||
                          `Driver ${route.team_member_id}`}
                      </span>
                      <span className="text-[11px] text-gray-400 truncate">
                        {Math.round(route.total_distance_meters / 1000)} km
                        {durationStr ? ` • ${durationStr}` : ""}
                        {` • ${totalStopsCount} stops`}
                      </span>
                    </div>

                    {/* ••• Menu */}
                    <Dropdown
                      menu={{ items: getRouteMenuItems(routeIndex) }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <div
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 cursor-pointer transition-colors shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreOutlined className="text-gray-500 text-base" />
                      </div>
                    </Dropdown>
                  </div>

                  {/* Timeline Track */}
                  <div
                    className="relative z-0"
                    style={{ width: timelineWidth }}
                  >
                    {/* Connection Lines (Segments) */}
                    {route.stops?.map((stop: any, index: number) => {
                      if (index === route.stops.length - 1) return null; // Skip last stop

                      const nextStop = route.stops[index + 1];
                      const startPos = getPosition(
                        stop.arrival_time,
                        startTime,
                        pixelsPerMinute,
                      );
                      const endPos = getPosition(
                        nextStop.arrival_time,
                        startTime,
                        pixelsPerMinute,
                      );
                      const width = endPos - startPos;

                      const distanceKm =
                        (stop.distance_to_next_stop_meters ?? 0) / 1000;
                      const timeMin = Math.round(
                        (stop.time_to_next_stop_seconds ?? 0) / 60,
                      );

                      return (
                        <Tooltip
                          key={`link-${index}`}
                          title={`${timeMin} min, ${distanceKm.toFixed(2)} km`}
                        >
                          <div
                            className="absolute top-1/2 left-0 h-0.5 hover:opacity-100 transition-opacity cursor-pointer"
                            style={{
                              height: "5px",
                              backgroundColor: routeColor,
                              opacity: 0.3,
                              left: startPos,
                              width: width,
                              transform: "translateY(-50%)",
                            }}
                          />
                        </Tooltip>
                      );
                    })}

                    {/* Break Time Block */}
                    {route.break_info &&
                      (() => {
                        const breakStartPos = getPosition(
                          route.break_info.start_time,
                          startTime,
                          pixelsPerMinute,
                        );
                        const breakEndPos = getPosition(
                          route.break_info.end_time,
                          startTime,
                          pixelsPerMinute,
                        );
                        const breakWidth = breakEndPos - breakStartPos;

                        if (breakWidth <= 0) return null;

                        return (
                          <Tooltip
                            title={
                              <div>
                                <div className="font-semibold">☕ Break</div>
                                <div>
                                  Duration: {route.break_info.duration_minutes}{" "}
                                  min
                                </div>
                                {route.break_info.location
                                  ?.address_formatted && (
                                  <div className="text-xs">
                                    📍{" "}
                                    {
                                      route.break_info.location
                                        .address_formatted
                                    }
                                  </div>
                                )}
                              </div>
                            }
                          >
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-6 border border-gray-400 cursor-pointer opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center"
                              style={{
                                left: breakStartPos,
                                width: breakWidth,
                                backgroundColor: "#8c8c8c",
                                minWidth: 24,
                              }}
                            >
                              <span className="text-white text-xs">☕</span>
                            </div>
                          </Tooltip>
                        );
                      })()}

                    {/* Idle Time Blocks */}
                    {route.idle_blocks?.map((idle: any, idleIndex: number) => {
                      const idleStartPos = getPosition(
                        idle.start_time,
                        startTime,
                        pixelsPerMinute,
                      );
                      const idleEndPos = getPosition(
                        idle.end_time,
                        startTime,
                        pixelsPerMinute,
                      );
                      const idleWidth = idleEndPos - idleStartPos;

                      if (idleWidth <= 0) return null;

                      return (
                        <Tooltip
                          key={`idle-${idleIndex}`}
                          title={
                            <div>
                              <div className="font-semibold">⏳ Idle Time</div>
                              <div>Waiting: {idle.duration_minutes} min</div>
                              {idle.location?.address_formatted && (
                                <div className="text-xs">
                                  📍 {idle.location.address_formatted}
                                </div>
                              )}
                            </div>
                          }
                        >
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-6 border border-gray-300 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                            style={{
                              left: idleStartPos,
                              width: idleWidth,
                              backgroundColor: "#f5f5f5",
                              backgroundImage: `repeating-linear-gradient(
                                  45deg,
                                  transparent,
                                  transparent 3px,
                                  rgba(0,0,0,0.08) 3px,
                                  rgba(0,0,0,0.08) 6px
                                )`,
                            }}
                          />
                        </Tooltip>
                      );
                    })}

                    {/* Stops - Now with service duration width */}
                    {route.stops.map((stop: any, stopIndex: number) => {
                      const arrivalTime = dayjs(stop.arrival_time);
                      const serviceDuration =
                        stop.service_duration_minutes || 0;
                      const departureTime = arrivalTime.add(
                        serviceDuration,
                        "minute",
                      );

                      const left = getPosition(
                        stop.arrival_time,
                        startTime,
                        pixelsPerMinute,
                      );

                      // Calculate block width based on service duration
                      const blockWidth = serviceDuration * pixelsPerMinute;

                      const isDepot = stop.stop_type === "depot";
                      // Worker-shuttle routes use "pickup"/"dropoff" instead of
                      // the generic "job" stop type.
                      const isPickup = stop.stop_type === "pickup";
                      const isDropoff =
                        stop.stop_type === "dropoff" ||
                        stop.stop_type === "drop_off";
                      const isJob =
                        stop.stop_type === "job" || isPickup || isDropoff;
                      const stopTypeLabel = isPickup
                        ? "Pickup"
                        : isDropoff
                          ? "Drop-off"
                          : null;

                      let jobStatus = "assigned";
                      if (isJob) {
                        const mapStatus = stop.job_id ? jobsMap.get(Number(stop.job_id)) : undefined;
                        jobStatus = mapStatus || stop.job?.status || stop.status || "assigned";
                      }

                      let blockBgColor = routeColor;
                      let blockBorderColor = routeColor;
                      let blockTextColor = "white";

                      if (isJob) {
                        if (jobStatus === "completed" || jobStatus === "success") {
                          blockBgColor = routeColor;
                          blockBorderColor = routeColor;
                          blockTextColor = "white";
                        } else if (jobStatus === "failed") {
                          blockBgColor = "#f5222d"; // Red
                          blockBorderColor = "#f5222d";
                          blockTextColor = "white";
                        } else if (jobStatus === "skipped") {
                          blockBgColor = "#8c8c8c"; // Gray
                          blockBorderColor = "#8c8c8c";
                          blockTextColor = "white";
                        } else {
                          blockBgColor = "white";
                          blockBorderColor = routeColor;
                          blockTextColor = routeColor;
                        }
                      }

                      // For jobs with service duration, show as a bar
                      if (isJob && serviceDuration > 0) {
                        return (
                          <Tooltip
                            key={stopIndex}
                            title={
                              <div>
                                <div className="font-semibold">
                                  {stop.address_formatted ||
                                    `Job #${stop.job_id}`}
                                </div>
                                {stopTypeLabel && (
                                  <div className="text-xs font-semibold uppercase opacity-80">
                                    {stopTypeLabel}
                                  </div>
                                )}
                                <div className="text-xs">
                                  ETA:{" "}
                                  {arrivalTime.isValid()
                                    ? arrivalTime.format("HH:mm")
                                    : "--:--"}
                                </div>
                                <div className="text-xs">
                                  Departure:{" "}
                                  {departureTime.isValid()
                                    ? departureTime.format("HH:mm")
                                    : "--:--"}
                                </div>
                                <div className="text-xs">
                                  Service: {serviceDuration} min
                                </div>
                                <div className="text-xs uppercase mt-1 opacity-80">
                                  Status: {jobStatus}
                                </div>
                              </div>
                            }
                          >
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-8 flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer z-10 border-2"
                              style={{
                                left: left,
                                width: Math.max(blockWidth, 28), // Minimum width for visibility
                                backgroundColor: blockBgColor,
                                borderColor: blockBorderColor,
                              }}
                              onClick={() =>
                                onStopClick?.(stop, routeIndex, stopIndex)
                              }
                            >
                              <span className="text-xs font-bold" style={{ color: blockTextColor }}>
                                {stopIndex}
                              </span>
                            </div>
                          </Tooltip>
                        );
                      }

                      // For depot and jobs without service duration, show as marker
                      return (
                        <Tooltip
                          key={stopIndex}
                          title={
                            <div>
                              <div>
                                {isDepot
                                  ? "Depot"
                                  : stop.address_formatted ||
                                    `Job #${stop.job_id}`}
                              </div>
                              {stopTypeLabel && (
                                <div className="text-xs font-semibold uppercase text-gray-300">
                                  {stopTypeLabel}
                                </div>
                              )}
                              <div className="text-xs text-gray-400">
                                {arrivalTime.isValid()
                                  ? arrivalTime.format("HH:mm")
                                  : "--:--"}
                              </div>
                              {isJob && (
                                <div className="text-xs uppercase mt-1 opacity-80 text-gray-400">
                                  Status: {jobStatus}
                                </div>
                              )}
                            </div>
                          }
                        >
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center border-2 shadow-md transition-all hover:scale-110 cursor-pointer ${
                              isDepot
                                ? "w-8 h-8 rounded-lg bg-linear-to-br from-slate-700 to-slate-900 border-slate-600 z-10 shadow-lg text-white"
                                : "w-8 h-8 rounded z-0"
                            }`}
                            style={{
                              left: left - 14,
                              backgroundColor: isDepot ? undefined : blockBgColor,
                              borderColor: isDepot ? undefined : blockBorderColor,
                            }}
                            onClick={() =>
                              onStopClick?.(stop, routeIndex, stopIndex)
                            }
                          >
                            {isDepot ? (
                              <HomeFilled className="text-white text-base" />
                            ) : (
                              <span
                                className="text-xs font-bold"
                                style={{ color: blockTextColor }}
                              >
                                {stopIndex}
                              </span>
                            )}
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
