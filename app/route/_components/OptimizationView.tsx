"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Panel, PanelGroup } from "react-resizable-panels";
import { Typography, Button, Tooltip, Input, message, Divider } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ExportOutlined,
  ShareAltOutlined,
  EditOutlined,
} from "@ant-design/icons";
import GoogleMaps from "@/components/GoogleMaps";
import TimelineView from "./TimelineView";
import { Route } from "@/types/routes.type";
import { useJobsStore } from "@/store/jobs.store";
import { useOptimizationStore } from "@/store/optimization.store";
import { useRouteStore } from "@/store/routes.store";
import { useIndexStore } from "@/store/index.store";
import RouteInfoWindow from "./RouteInfoWindow";
import RouteExportPreview from "./RouteExportPreview";
import {
  generateRoutePolylines,
  generateMapMarkers,
} from "./optimizationView.utils";
import ResizeHandle from "@/components/ResizeHandle";
import Icon from "@ant-design/icons";

const { Title, Text } = Typography;

interface OptimizationViewProps {
  route: Route;
}

const OptimizationView = ({ route }: OptimizationViewProps) => {
  const router = useRouter();
  const { setCurrentTab } = useIndexStore();
  const { jobs } = useJobsStore();
  const { updateOptimization, clearOptimization } = useOptimizationStore();
  const { fetchJobsByDate } = useJobsStore();
  const { updateRoute } = useRouteStore();

  useEffect(() => {
    if (route.scheduled_date) {
      fetchJobsByDate(route.scheduled_date);
    }
  }, [route.scheduled_date, fetchJobsByDate]);
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
    stopIndex: number,
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
    setShowPreview(true);
  };

  // Calculate route statistics
  const totalStops =
    route.result?.routes?.reduce((acc, r) => acc + (r.stops?.length || 0), 0) ||
    0;
  const totalVehicles = route.result?.routes?.length || 0;

  const handleBackToDashboard = () => {
    setCurrentTab("routes");
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col h-full absolute inset-0">
      {/* Header - matching NavBar height */}
      <nav className="bg-white border-b border-gray-200 px-3 shrink-0">
        <div className="flex items-center justify-between h-14 relative">
          {/* Left: Back Button + Route Name */}
          <div className="flex items-center gap-3">
            <Icon
              component={ArrowLeftOutlined}
              style={{ color: "#003220" }}
              onClick={handleBackToDashboard}
            />

            {/* Fixed width container for name to prevent layout shift */}
            <div style={{ width: "200px" }}>
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
                  style={{ width: "100%" }}
                />
              ) : (
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={handleNameClick}
                  title="Click to edit route name"
                >
                  <Title
                    level={5}
                    className="mt-2 group-hover:text-primary transition-colors truncate"
                  >
                    {route.route_name}
                  </Title>
                  <EditOutlined className="text-gray-400 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Center: Stats */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Text type="secondary">
              <CalendarOutlined /> {route.scheduled_date}
            </Text>
            <Text type="secondary">
              <EnvironmentOutlined /> {totalStops} stops
            </Text>
            <Text type="secondary">
              <TeamOutlined /> {totalVehicles}{" "}
              {totalVehicles === 1 ? "vehicle" : "vehicles"}
            </Text>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-2">
            <Button icon={<ExportOutlined />} onClick={handleExportRoutes}>
              Export
            </Button>
            <Tooltip title="Coming soon">
              <Button type="primary" icon={<ShareAltOutlined />}>
                Share to App
              </Button>
            </Tooltip>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
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
            <div className="flex flex-col h-full bg-gray-50 mt-2 overflow-hidden isolate">
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
