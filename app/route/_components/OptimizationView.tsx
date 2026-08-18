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
  shareOptimizationRoutes,
  type ShareRouteResponse,
} from "@/apis/routes.api";

import JobDetailsCard from "./JobDetailsCard";

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
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<ShareRouteResponse | null>(
    null,
  );

  // Job Details Floating Card state
  const [selectedDrawerJob, setSelectedDrawerJob] = useState<{
    stopData: any;
    job: Job | null;
    driverName?: string;
    routeIndex?: number;
    stopIndex?: number;
  } | null>(null);

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

  const handleShareToApp = async () => {
    setIsSharing(true);
    try {
      const result = await shareOptimizationRoutes(route.id);
      setShareResult(result);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        "Failed to share routes. Please try again.";
      message.error(detail);
    } finally {
      setIsSharing(false);
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

    // Find corresponding job object
    const jobId = stop.job_id || stop.id;
    const matchedJob = jobs.find((j) => j.id === jobId) || stop.job || null;
    const driverName = route.result?.routes?.[routeIndex]?.team_member_name || `Driver ${routeIndex + 1}`;

    setSelectedDrawerJob({
      stopData: stop,
      job: matchedJob,
      driverName,
      routeIndex,
      stopIndex,
    });
  };

  const handleMarkerSelect = (markerId: string | number | null) => {
    setSelectedMarkerId(markerId);
    if (!markerId) {
      setSelectedDrawerJob(null);
      return;
    }

    const foundMarker = markers.find((m) => String(m.id) === String(markerId));
    if (foundMarker && foundMarker.jobData && route.result?.routes) {
      const jobId = (foundMarker.jobData as any).id || (foundMarker.jobData as any).job_id;
      const matchedJob = jobs.find((j) => j.id === jobId) || (foundMarker.jobData as Job) || null;

      let routeIndex = -1;
      let stopIndex = 0;
      let driverName = "Driver";

      routeIndex = route.result.routes.findIndex((r) =>
        r.stops?.some((s) => s.job_id === jobId)
      );
      if (routeIndex >= 0) {
        driverName =
          route.result.routes[routeIndex].team_member_name ||
          `Driver ${routeIndex + 1}`;
        const sIdx = route.result.routes[routeIndex].stops?.findIndex(
          (s) => s.job_id === jobId);
        if (sIdx !== undefined && sIdx >= 0) {
          stopIndex = sIdx;
        }
      }

      setSelectedDrawerJob({
        stopData: foundMarker.jobData,
        job: matchedJob,
        driverName,
        routeIndex,
        stopIndex,
      });
    }
  };

  const handleExportRoutes = () => {
    setShowPreview(true);
  };

  // ── Route Operations handlers ──

  const startOperationPolling = useCallback(() => {
    pollOptimizationStatus(route.id);
  }, [pollOptimizationStatus, route.id]);

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
        content: `Remove job from ${driverName}'s route? It will be moved back to Unassigned.`,
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

  const handleSwapSuccess = useCallback(() => {
    startOperationPolling();
  }, [startOperationPolling]);

  const getRouteData = (index: number | null) =>
    index !== null ? route.result?.routes?.[index] : null;

  const totalStops =
    route.result?.routes?.reduce((acc, r) => acc + (r.stops?.length || 0), 0) ||
    0;
  const totalVehicles = route.result?.routes?.length || 0;

  const handleBackToPlanRoutes = () => {
    setCurrentTab("routes");
    router.push("/plan");
  };

  return (
    <div className="flex flex-col h-full absolute inset-0">
      {/* Full-screen loading overlay */}
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
              onClick={handleBackToPlanRoutes}
            />

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
              {totalVehicles === 1 ? "team member" : "team members"}
            </Text>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-2">
            <Button icon={<ExportOutlined />} onClick={handleExportRoutes}>
              Export
            </Button>
            <Button
              type="primary"
              icon={isSharing ? <LoadingOutlined /> : <ShareAltOutlined />}
              loading={isSharing}
              disabled={isSharing}
              onClick={handleShareToApp}
            >
              Share to App
            </Button>
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
            <div className="h-full w-full relative">
              <GoogleMaps
                polylines={routePolylines}
                markers={markers}
                center={center}
                zoom={12}
                selectedMarkerId={selectedMarkerId}
                onMarkerSelect={handleMarkerSelect}
                showDirectionArrows={true}
              />
            </div>
          </Panel>

          <ResizeHandle />

          <Panel defaultSize={40} minSize={20}>
            <div className="flex flex-col h-full bg-gray-50 min-h-0 min-w-0">
              <div className="flex-1 min-h-0 min-w-0">
                <TimelineView
                  routes={route.result?.routes || []}
                  jobs={jobs}
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

        {/* Upper-styled Floating Job Details Card Overlay (Over Map AND Timeline View!) */}
        {selectedDrawerJob && (
          <JobDetailsCard
            stopData={selectedDrawerJob.stopData}
            job={selectedDrawerJob.job}
            stopIndex={selectedDrawerJob.stopIndex}
            driverName={selectedDrawerJob.driverName}
            onClose={() => setSelectedDrawerJob(null)}
            onRemoveJob={
              selectedDrawerJob.routeIndex !== undefined &&
              selectedDrawerJob.routeIndex >= 0 &&
              selectedDrawerJob.job?.id
                ? () =>
                    handleRemoveJob(
                      selectedDrawerJob.routeIndex!,
                      selectedDrawerJob.job!.id,
                      selectedDrawerJob.driverName || "Driver",
                    )
                : undefined
            }
          />
        )}
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

      <Modal
        open={shareResult !== null}
        onCancel={() => setShareResult(null)}
        onOk={() => setShareResult(null)}
        title={
          <span className="flex items-center gap-2">
            <ShareAltOutlined className="text-green-500" />
            Route Shared Successfully
          </span>
        }
        okText="Done"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
      >
        {shareResult && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-100">
              <span className="text-green-700 font-medium">
                Drivers notified
              </span>
              <span className="text-2xl font-bold text-green-600">
                {shareResult.shared_count}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {shareResult.online_drivers.length}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Online — received instantly
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-500">
                  {shareResult.shared_count - shareResult.online_drivers.length}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Offline — will receive on next login
                </div>
              </div>
            </div>

            {shareResult.shared_count === 0 && (
              <Alert
                type="warning"
                showIcon
                message="No drivers with assigned routes found. Make sure routes have drivers assigned before sharing."
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OptimizationView;
