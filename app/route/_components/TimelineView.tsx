import React, { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Avatar, Tooltip, Select } from "antd";
import { UserOutlined, HomeFilled } from "@ant-design/icons";
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
  onStopClick?: (stop: any, routeIndex: number, stopIndex: number) => void;
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

const TimelineView: React.FC<TimelineViewProps> = ({ routes, onStopClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [intervalMinutes, setIntervalMinutes] = useState(30);

  const { startTime, endTime } = useMemo(
    () => calculateTimeRange(routes),
    [routes]
  );

  // Dynamic pixels per minute based on interval - smaller intervals get more spread
  const pixelsPerMinute = getPixelsPerMinute(intervalMinutes);

  const totalDurationMinutes = endTime.diff(startTime, "minute");
  const timelineWidth = totalDurationMinutes * pixelsPerMinute;
  const timeMarkers = useMemo(
    () =>
      generateTimeMarkers(startTime, endTime, intervalMinutes, pixelsPerMinute),
    [startTime, endTime, intervalMinutes, pixelsPerMinute]
  );

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
              className="sticky left-0 z-30 bg-gray-50 border-r border-gray-200 px-4 flex items-center justify-between font-medium text-gray-500 shadow-sm"
              style={{ width: 250, minWidth: 250 }}
            >
              <span>Driver</span>
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
              style={{ marginLeft: 250, width: timelineWidth }}
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

              return (
                <div
                  key={routeIndex}
                  className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Sticky Driver Info */}
                  <div
                    className="sticky left-0 z-10 bg-white border-r border-gray-200 px-4 flex items-center gap-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]"
                    style={{ width: 250, minWidth: 250 }}
                  >
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: routeColor }}
                      className="text-white"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate text-gray-700">
                        {route.team_member_name ||
                          `Driver ${route.team_member_id}`}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {route.stops.length} stops •{" "}
                        {Math.round(route.total_distance_meters / 1000)} km
                      </span>
                    </div>
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
                        pixelsPerMinute
                      );
                      const endPos = getPosition(
                        nextStop.arrival_time,
                        startTime,
                        pixelsPerMinute
                      );
                      const width = endPos - startPos;

                      const distanceKm =
                        (stop.distance_to_next_stop_meters ?? 0) / 1000;
                      const timeMin = Math.round(
                        (stop.time_to_next_stop_seconds ?? 0) / 60
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

                    {/* Idle Time Blocks */}
                    {route.idle_blocks?.map((idle: any, idleIndex: number) => {
                      const idleStartPos = getPosition(
                        idle.start_time,
                        startTime,
                        pixelsPerMinute
                      );
                      const idleEndPos = getPosition(
                        idle.end_time,
                        startTime,
                        pixelsPerMinute
                      );
                      const idleWidth = idleEndPos - idleStartPos;

                      if (idleWidth <= 0) return null;

                      return (
                        <Tooltip
                          key={`idle-${idleIndex}`}
                          title={
                            <div>
                              <div className="font-semibold">Idle Time</div>
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
                            className="absolute top-1/2 -translate-y-1/2 h-6 rounded-sm border border-gray-300 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
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
                        "minute"
                      );

                      const left = getPosition(
                        stop.arrival_time,
                        startTime,
                        pixelsPerMinute
                      );

                      // Calculate block width based on service duration
                      const blockWidth = serviceDuration * pixelsPerMinute;

                      const isDepot = stop.stop_type === "depot";
                      const isJob = stop.stop_type === "job";

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
                              </div>
                            }
                          >
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-8 flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer z-10 border-2"
                              style={{
                                left: left,
                                width: Math.max(blockWidth, 28), // Minimum width for visibility
                                backgroundColor: routeColor,
                                borderColor: routeColor,
                              }}
                              onClick={() =>
                                onStopClick?.(stop, routeIndex, stopIndex)
                              }
                            >
                              <span className="text-xs font-bold text-white">
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
                              <div className="text-xs text-gray-400">
                                {arrivalTime.isValid()
                                  ? arrivalTime.format("HH:mm")
                                  : "--:--"}
                              </div>
                            </div>
                          }
                        >
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center border-2 shadow-md transition-all hover:scale-110 cursor-pointer ${
                              isDepot
                                ? "w-8 h-8 rounded-lg bg-linear-to-br from-slate-700 to-slate-900 border-slate-600 z-10 shadow-lg text-white"
                                : "w-8 h-8 rounded bg-white z-0"
                            }`}
                            style={{
                              left: left - 14,
                              borderColor: isDepot ? undefined : routeColor,
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
                                style={{ color: routeColor }}
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
