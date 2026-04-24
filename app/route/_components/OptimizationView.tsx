"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Panel, PanelGroup } from "react-resizable-panels";
import {
  Typography,
  Button,
  Tooltip,
  Input,
  message,
  Divider,
  Modal,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ExportOutlined,
  ShareAltOutlined,
  EditOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import GoogleMaps from "@/components/GoogleMaps";
import TimelineView from "./TimelineView";
import AddJobsModal from "@/app/plan/AddJobsModal";
import SwapDriverDrawer from "./SwapDriverDrawer";
import { Route } from "@/types/routes.type";
import type { Job } from "@/types/job.type";
import { useJobsStore } from "@/store/jobs.store";
import { useOptimizationStore } from "@/store/optimization.store";
import { useRouteStore } from "@/store/routes.store";
import { useIndexStore } from "@/store/index.store";
import { useTeamStore } from "@/store/team.store";
import RouteInfoWindow from "./RouteInfoWindow";
import RouteExportPreview from "./RouteExportPreview";
import {
  generateRoutePolylines,
  generateMapMarkers,
} from "./optimizationView.utils";
import ResizeHandle from "@/components/ResizeHandle";
import Icon from "@ant-design/icons";
import {
  addStopToRoute,
  removeStopFromRoute,
  swapRouteDriver,
  reverseRoute,
  reOptimizeRoute,
} from "@/apis/routes.api";

const { Title, Text } = Typography;

interface OptimizationViewProps {
  route: Route;
}

const OptimizationView = ({ route }: OptimizationViewProps) => {
  const router = useRouter();
  const { setCurrentTab } = useIndexStore();
  const {
    updateOptimization,
    clearOptimization,
    fetchOptimization,
    pollOptimizationStatus,
    stopPolling,
    isPolling,
    error,
  } = useOptimizationStore();
  const { jobs, fetchJobsByDate, fetchJobsByIds } = useJobsStore();
  const { updateRoute } = useRouteStore();
  const { teams, initializeTeams } = useTeamStore();

  useEffect(() => {
    if (route.job_ids && route.job_ids.length > 0) {
      fetchJobsByIds(route.job_ids);
    } else if (route.scheduled_date) {
      fetchJobsByDate(route.scheduled_date);
    }
  }, [route.job_ids, route.scheduled_date, fetchJobsByIds, fetchJobsByDate]);

  // Ensure team list is loaded for swap driver
  useEffect(() => {
    initializeTeams();
  }, [initializeTeams]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempRouteName, setTempRouteName] = useState(route.route_name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Route operations modal state
  const [addStopRouteIndex, setAddStopRouteIndex] = useState<number | null>(
    null,
  );
  const [swapDriverRouteIndex, setSwapDriverRouteIndex] = useState<
    number | null
  >(null);

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

  // ── Route Operations handlers ──

  /**
   * Start polling after an async route operation.
   * The backend sets status='processing', and the existing polling infra
   * in optimization.store.ts will detect the 'completed' transition.
   */
  const startOperationPolling = useCallback(() => {
    pollOptimizationStatus(route.id);
  }, [pollOptimizationStatus, route.id]);

  /** Handle Add Stop (2-step): after job is created, add it to the route */
  const handleJobCreatedForRoute = useCallback(
    async (job: Job) => {
      if (addStopRouteIndex === null) return;
      try {
        const res = await addStopToRoute(route.id, addStopRouteIndex, job.id);
        if (res.success) {
          message.success(res.message);
          startOperationPolling();
        }
      } catch (error: any) {
        message.error(error?.response?.data?.detail || "Failed to add job");
      }
    },
    [route.id, addStopRouteIndex, startOperationPolling],
  );

  const handleRemoveJob = useCallback(
    (routeIndex: number, jobId: number, driverName: string) => {
      Modal.confirm({
        title: "Remove Job",
        content: `Remove job #${jobId} from ${driverName}'s route? It will be moved back to Unassigned.`,
        okText: "Remove",
        okButtonProps: {
          style: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
        },
        onOk: async () => {
          try {
            const res = await removeStopFromRoute(route.id, routeIndex, jobId);
            if (res.success) {
              message.success(res.message);
              startOperationPolling();
            }
          } catch (error: any) {
            message.error(
              error?.response?.data?.detail || "Failed to remove job",
            );
          }
        },
      });
    },
    [route.id, startOperationPolling],
  );

  const handleReverseRoute = useCallback(
    async (routeIndex: number) => {
      const driverName =
        route.result?.routes?.[routeIndex]?.team_member_name || "Driver";
      Modal.confirm({
        title: "Reverse Route",
        content: `Reverse the stop order for ${driverName}'s route?`,
        okText: "Reverse",
        okButtonProps: { style: { backgroundColor: "#003220" } },
        onOk: async () => {
          try {
            const res = await reverseRoute(route.id, routeIndex);
            if (res.success) {
              message.success(res.message);
              // Sync op — just refresh data
              await fetchOptimization(route.id);
            }
          } catch (error: any) {
            message.error(
              error?.response?.data?.detail || "Failed to reverse route",
            );
          }
        },
      });
    },
    [route.id, route.result?.routes, fetchOptimization],
  );

  const handleReOptimize = useCallback(
    async (routeIndex: number) => {
      const driverName =
        route.result?.routes?.[routeIndex]?.team_member_name || "Driver";
      Modal.confirm({
        title: "Re-optimize Route",
        content: `Re-optimize ${driverName}'s route? This will re-run the optimization.`,
        okText: "Re-optimize",
        okButtonProps: { style: { backgroundColor: "#003220" } },
        onOk: async () => {
          try {
            const res = await reOptimizeRoute(route.id, routeIndex);
            if (res.success) {
              message.success(res.message);
              startOperationPolling();
            }
          } catch (error: any) {
            message.error(
              error?.response?.data?.detail || "Failed to re-optimize route",
            );
          }
        },
      });
    },
    [route.id, route.result?.routes, startOperationPolling],
  );

  /** Swap driver success → backend queued RQ → start polling */
  const handleSwapSuccess = useCallback(() => {
    startOperationPolling();
  }, [startOperationPolling]);

  // Get the selected route data for modals
  const getRouteData = (index: number | null) =>
    index !== null ? route.result?.routes?.[index] : null;

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
      {/* Full-screen loading overlay — shown during async route operations */}
      {isPolling && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#003220" }}
                  spin
                />
              }
            />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 m-0">
                Optimizing Route...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a few seconds
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 shrink-0 border-b border-red-100">
          <Alert
            message="Optimization Issue"
            description={error}
            type="error"
            showIcon
          />
        </div>
      )}

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
                InfoWindowModal={({ marker }) => {
                  // Find the routeIndex for this job so we can pass it to handleRemoveJob
                  let routeIndex = -1;
                  let driverName = "Driver";
                  if (marker.jobData && route.result?.routes) {
                    const jobId = (marker.jobData as Job).id;
                    routeIndex = route.result.routes.findIndex((r) =>
                      r.stops?.some((s) => s.job_id === jobId),
                    );
                    if (routeIndex >= 0) {
                      driverName =
                        route.result.routes[routeIndex].team_member_name ||
                        "Driver";
                    }
                  }

                  return (
                    <RouteInfoWindow
                      marker={marker}
                      onRemoveJob={
                        routeIndex >= 0 &&
                        marker.jobData &&
                        "id" in marker.jobData
                          ? () =>
                              handleRemoveJob(
                                routeIndex,
                                (marker.jobData as Job).id,
                                driverName,
                              )
                          : undefined
                      }
                    />
                  );
                }}
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
                  onAddStop={(idx) => setAddStopRouteIndex(idx)}
                  onSwapDriver={(idx) => setSwapDriverRouteIndex(idx)}
                  onReverseRoute={handleReverseRoute}
                  onReOptimize={handleReOptimize}
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

      {/* Add Stop Modal — reuses the existing AddJobsModal / JobForm */}
      <AddJobsModal
        open={addStopRouteIndex !== null}
        setOpen={(open) => {
          if (!open) setAddStopRouteIndex(null);
        }}
        onJobCreated={handleJobCreatedForRoute}
      />

      {/* Swap Driver Modal */}
      {swapDriverRouteIndex !== null && (
        <SwapDriverDrawer
          open={true}
          onClose={() => setSwapDriverRouteIndex(null)}
          optimizationId={route.id}
          routeIndex={swapDriverRouteIndex}
          currentDriverId={
            getRouteData(swapDriverRouteIndex)?.team_member_id ?? 0
          }
          currentDriverName={
            getRouteData(swapDriverRouteIndex)?.team_member_name ||
            `Driver ${swapDriverRouteIndex + 1}`
          }
          allDrivers={teams}
          optimizationDriverIds={route.team_member_ids || []}
          onSuccess={handleSwapSuccess}
        />
      )}
    </div>
  );
};

export default OptimizationView;
