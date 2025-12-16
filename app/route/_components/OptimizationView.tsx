"use client";
import React, { useMemo, useState, useEffect } from "react";
import { GripHorizontal } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Typography, Flex, Button, Tooltip } from "antd";
import GoogleMaps from "@/components/GoogleMaps";
import { decodePolyline } from "@/utils/googleMaps.utils";
import TimelineView from "./TimelineView";
import { getRouteColor } from "@/utils/timeline.utils";
import { Route, Stop } from "@/types/routes.type";
import { useJobsStore } from "@/zustand/jobs.store";
import { exportToExcel } from "@/utils/export.utils";
import RouteInfoWindow from "./RouteInfoWindow";

const { Title, Text } = Typography;

interface OptimizationViewProps {
  route: Route;
}

const OptimizationView = ({ route }: OptimizationViewProps) => {
  const { jobs } = useJobsStore();
  const [isExporting, setIsExporting] = useState(false);

  // Decode polyline for the map
  const routePolylines = useMemo(() => {
    if (!route?.result?.routes) return [];

    return route.result.routes.flatMap((routeItem, index) => {
      if (!routeItem.route_polyline) return [];
      const color = getRouteColor(index);
      return [
        {
          path: decodePolyline(routeItem.route_polyline),
          options: {
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 4,
          },
        },
      ];
    });
  }, [route]);

  /* Move markers useMemo before center state to derive initial center */
  const markers = useMemo(() => {
    if (!route?.result?.routes) return [];
    return route.result.routes.flatMap((routeItem, index) => {
      const color = getRouteColor(index);
      return routeItem.stops
        .filter(
          (stop: any) =>
            typeof stop.latitude === "number" &&
            typeof stop.longitude === "number"
        )
        .map((stop: any, stopIndex: number) => {
          const job = stop.job_id
            ? jobs.find((j) => j.id === stop.job_id)
            : undefined;

          return {
            id: `${index}-${stopIndex}`,
            color: color, // Pass color string to be handled by GoogleMaps
            position: { lat: stop.latitude, lng: stop.longitude },
            label: {
              text: (stopIndex + 1).toString(),
              color: "white",
              fontWeight: "bold",
            },
            title: stop.address_formatted || "Unknown location",
            description: stop.arrival_time
              ? `ETA: ${new Date(stop.arrival_time).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}`
              : undefined,
            jobData: job,
            sequenceNumber: stopIndex + 1,
            isDepot: stop.stop_type === "depot",
          };
        });
    });
  }, [route, jobs]);

  const initialCenter = useMemo<google.maps.LatLngLiteral>(() => {
    return markers[0]?.position ?? { lat: 37.7749, lng: -122.4194 };
  }, [markers]);

  const [center, setCenter] =
    useState<google.maps.LatLngLiteral>(initialCenter);

  useEffect(() => {
    setCenter(initialCenter);
  }, [initialCenter]);

  const [selectedMarkerId, setSelectedMarkerId] = useState<
    string | number | null
  >(null);

  const handleStopClick = (stop: any) => {
    if (
      typeof stop.latitude === "number" &&
      typeof stop.longitude === "number"
    ) {
      setCenter({ lat: stop.latitude, lng: stop.longitude });
      const marker = markers.find(
        (m) =>
          Math.abs(m.position.lat - stop.latitude) < 0.0001 &&
          Math.abs(m.position.lng - stop.longitude) < 0.0001
      );
      if (marker) {
        setSelectedMarkerId(marker.id);
      }
    }
  };

  const handleMarkerSelect = (markerId: string | number | null) => {
    setSelectedMarkerId(markerId);
  };

  const handleExportRoutes = () => {
    try {
      setIsExporting(true);
      const flattenData: any[] = [];

      if (route.result?.routes) {
        route.result.routes.forEach((routeItem) => {
          routeItem.stops.forEach((stop: Stop) => {
            // Find primitive job details if available
            const jobDetails = stop.job_id
              ? jobs.find((j) => j.id === stop.job_id)
              : null;

            // Calculate duration (using primitive difference if next stop exists, or 0)
            // Ideally this comes from the route/stop data if available.
            // Current types show total_duration_seconds for route, but only arrival_time for stops.
            // We can leave duration empty or calculate gaps if needed. Sticking to simple for now.

            flattenData.push({
              Priority: jobDetails?.priority_level || "Medium",
              Address: stop.address_formatted,
              ETA: stop.arrival_time
                ? new Date(stop.arrival_time).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "-",
              "Phone Number": jobDetails?.phone_number || "-",
              Duration: jobDetails?.service_duration,
              "Team Member (Driver)":
                routeItem.team_member_name || "Unassigned",
            });
          });
        });
      }

      exportToExcel(flattenData, {
        fileName: `${route.route_name}_Report`,
        metadata: {
          "Route Name": route.route_name,
          "Scheduled Date": route.scheduled_date,
        },
        columnWidths: [15, 40, 15, 20, 15, 25],
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full absolute inset-0 p-2">
      <div className="flex-1 min-h-0 relative">
        <PanelGroup direction="vertical">
          {/* Map Panel */}
          <Panel defaultSize={60} minSize={30}>
            <div className="h-full w-full">
              <GoogleMaps
                polylines={routePolylines}
                markers={markers}
                center={center}
                zoom={12}
                InfoWindowModal={RouteInfoWindow}
                selectedMarkerId={selectedMarkerId}
                onMarkerSelect={handleMarkerSelect}
                showDirectionArrows={true}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="relative h-2 bg-gray-100 hover:bg-blue-50 transition-colors cursor-ns-resize flex items-center justify-center group border-y border-gray-200">
            <GripHorizontal
              size={16}
              className="text-gray-400 group-hover:text-blue-500"
            />
          </PanelResizeHandle>

          <Panel defaultSize={40} minSize={20}>
            <div className="flex flex-col h-full bg-gray-50 border-t border-gray-200">
              <div className="py-2 bg-white border-b border-gray-200">
                <Flex justify="space-between" align="center">
                  <div className="flex gap-4 items-baseline">
                    <Title level={5} className="m-0">
                      {route.route_name}
                    </Title>
                    <Text type="secondary">{route.scheduled_date}</Text>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={handleExportRoutes}
                      loading={isExporting}
                    >
                      Export Routes
                    </Button>
                    <Tooltip title="Not implemented yet">
                      <Button type="primary" size="small">
                        Share to App
                      </Button>
                    </Tooltip>
                  </div>
                </Flex>
              </div>
              <div className="flex-1 overflow-hidden">
                <TimelineView
                  routes={route.result?.routes || []}
                  onStopClick={handleStopClick}
                />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default OptimizationView;
