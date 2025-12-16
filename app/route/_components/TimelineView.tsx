import React, { useMemo, useRef } from "react";
import dayjs from "dayjs";
import { Avatar, Tooltip } from "antd";
import { UserOutlined, HomeFilled } from "@ant-design/icons";
import {
  calculateTimeRange,
  generateTimeMarkers,
  getPosition,
  PIXELS_PER_MINUTE,
  ROW_HEIGHT,
  HEADER_HEIGHT,
  getRouteColor,
} from "@/utils/timeline.utils";

interface TimelineViewProps {
  routes: any[];
  onStopClick?: (stop: any) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ routes, onStopClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { startTime, endTime } = useMemo(
    () => calculateTimeRange(routes),
    [routes]
  );
  const totalDurationMinutes = endTime.diff(startTime, "minute");
  const timelineWidth = totalDurationMinutes * PIXELS_PER_MINUTE;
  const timeMarkers = useMemo(
    () => generateTimeMarkers(startTime, endTime),
    [startTime, endTime]
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
              className="sticky left-0 z-30 bg-gray-50 border-r border-gray-200 px-4 flex items-center font-medium text-gray-500 shadow-sm"
              style={{ width: 250, minWidth: 250 }}
            >
              Driver
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
                        {Math.round(route.total_distance_meters / 1609.34)} mi
                      </span>
                    </div>
                  </div>

                  {/* Timeline Track */}
                  <div
                    className="relative z-0"
                    style={{ width: timelineWidth }}
                  >
                    {/* Connection Line */}
                    {route.stops?.length > 0 && (
                      <div
                        className="absolute top-1/2 left-0 h-0.5"
                        style={{
                          backgroundColor: routeColor,
                          opacity: 0.3,
                          left: getPosition(
                            route.stops[0].arrival_time,
                            startTime
                          ),
                          width:
                            getPosition(
                              route.stops[route.stops.length - 1].arrival_time,
                              startTime
                            ) -
                            getPosition(route.stops[0].arrival_time, startTime),
                          transform: "translateY(-50%)",
                        }}
                      />
                    )}

                    {/* Stops */}
                    {route.stops.map((stop: any, stopIndex: number) => {
                      const left = getPosition(stop.arrival_time, startTime);
                      const isDepot = stop.stop_type === "depot";

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
                                {dayjs(stop.arrival_time).isValid()
                                  ? dayjs(stop.arrival_time).format("HH:mm")
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
                            onClick={() => onStopClick?.(stop)}
                          >
                            {isDepot ? (
                              <HomeFilled className="text-white text-base" />
                            ) : (
                              <span
                                className="text-xs font-bold"
                                style={{ color: routeColor }}
                              >
                                {stopIndex + 1}
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
