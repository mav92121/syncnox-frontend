"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { Typography, Flex, Button, Tooltip, Input, message } from "antd";
import GoogleMaps from "@/components/GoogleMaps";
import TimelineView from "./TimelineView";
import { Route } from "@/types/routes.type";
import { useJobsStore } from "@/store/jobs.store";
import { useOptimizationStore } from "@/store/optimization.store";
import { useRouteStore } from "@/store/routes.store";
import RouteInfoWindow from "./RouteInfoWindow";
import RouteExportPreview from "./RouteExportPreview";
import {
  generateRoutePolylines,
  generateMapMarkers,
} from "./optimizationView.utils";
import ResizeHandle from "@/components/ResizeHandle";

const { Title, Text } = Typography;

interface OptimizationViewProps {
  route: Route;
}

const OptimizationView = ({ route }: OptimizationViewProps) => {
  const { jobs } = useJobsStore();
  const { updateOptimization, clearOptimization } = useOptimizationStore();
  const { updateRoute } = useRouteStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempRouteName, setTempRouteName] = useState(route.route_name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setTempRouteName(route.route_name);
  }, [route.route_name]);

  useEffect(() => {
    return () => {
      clearOptimization();
    };
  }, [clearOptimization]);

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (tempRouteName.trim() === "" || tempRouteName === route.route_name) {
      setIsEditingName(false);
      setTempRouteName(route.route_name);
      return;
    }

    try {
      setIsSavingName(true);
      const updatedRoute = await updateOptimization(route.id, {
        route_name: tempRouteName,
      });
      updateRoute(updatedRoute);
      message.success("Route name updated successfully");
      setIsEditingName(false);
    } catch (error) {
      message.error("Failed to update route name");
      setTempRouteName(route.route_name);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const routePolylines = useMemo(() => {
    return generateRoutePolylines(route);
  }, [route]);

  const markers = useMemo(() => {
    return generateMapMarkers(route, jobs);
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

  const handleStopClick = (
    stop: any,
    routeIndex: number,
    stopIndex: number
  ) => {
    if (
      typeof stop.latitude === "number" &&
      typeof stop.longitude === "number"
    ) {
      setCenter({ lat: stop.latitude, lng: stop.longitude });
      const markerId = `${routeIndex}-${stopIndex}`;
      setSelectedMarkerId(markerId);
    }
  };

  const handleMarkerSelect = (markerId: string | number | null) => {
    setSelectedMarkerId(markerId);
  };

  const handleExportRoutes = () => {
    // Open preview modal instead of direct export
    setShowPreview(true);
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

          <ResizeHandle />

          <Panel defaultSize={40} minSize={20}>
            <div className="flex flex-col h-full bg-gray-50 border-t border-gray-200">
              <div className="py-2 bg-white border-b border-gray-200">
                <Flex justify="space-between" align="center">
                  <div className="flex gap-4 items-baseline">
                    {isEditingName ? (
                      <Input
                        size="small"
                        value={tempRouteName}
                        onChange={(e) => setTempRouteName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={handleNameKeyDown}
                        autoFocus
                        disabled={isSavingName}
                        maxLength={50}
                      />
                    ) : (
                      <Title
                        level={5}
                        className="m-0 cursor-pointer hover:text-blue-600 hover:underline decoration-dashed underline-offset-4 transition-all"
                        onClick={handleNameClick}
                        title="Click to edit route name"
                      >
                        {route.route_name}
                      </Title>
                    )}
                    <Text type="secondary" className="whitespace-nowrap">
                      {route.scheduled_date}
                    </Text>
                  </div>
                  <div className="flex gap-2">
                    <Button size="small" onClick={handleExportRoutes}>
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

      {/* Route Export Preview Modal */}
      <RouteExportPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        route={route}
        jobs={jobs}
      />
    </div>
  );
};

export default OptimizationView;
