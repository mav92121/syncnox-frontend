"use client";
import React, { useMemo } from "react";
import { GripHorizontal } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Typography, Flex } from "antd";
import GoogleMaps from "@/components/GoogleMaps";
import { decodePolyline } from "@/utils/googleMaps.utils";
import TimelineView from "./TimelineView";
import { getRouteColor } from "@/utils/timeline.utils";
import { Route } from "@/types/routes.type";

const { Title, Text } = Typography;

interface OptimizationViewProps {
  route: Route;
}

const OptimizationView = ({ route }: OptimizationViewProps) => {
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

  const [center, setCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: 37.7749,
    lng: -122.4194,
  });

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
        .map((stop: any, stopIndex: number) => ({
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
            ? `ETA: ${new Date(stop.arrival_time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}`
            : undefined,
        }));
    });
  }, [route]);

  const handleStopClick = (stop: any) => {
    if (stop.latitude && stop.longitude) {
      setCenter({ lat: stop.latitude, lng: stop.longitude });
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
              <div className="px-4 py-2 bg-white border-b border-gray-200">
                <Flex justify="space-between" align="center">
                  <div className="flex gap-4 items-baseline">
                    <Title level={5} className="m-0">
                      {route.route_name}
                    </Title>
                    <Text type="secondary">{route.scheduled_date}</Text>
                  </div>
                  {/* Legend could go here */}
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
