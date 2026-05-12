"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin, DatePicker, Typography, Flex } from "antd";
import { Dayjs } from "dayjs";
import {
  FileTextOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileAddOutlined,
  RocketOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { useIndexStore } from "@/store/index.store";
import { useDashboardStore, defaultDashboard } from "@/store/dashboard.store";
import { RecentRoute } from "@/types/dashboard.type";
import { fetchRoutes } from "@/apis/routes.api";
import { AllRoutes } from "@/types/routes.type";
import AddJobsModal from "@/app/plan/AddJobsModal";
import { useJobsStore } from "@/store/jobs.store";

const { Title, Text } = Typography;

export default function DashboardView() {
  const router = useRouter();
  const { setCurrentTab } = useIndexStore();
  const { dashboardData, isLoading, error, fetchDashboard } =
    useDashboardStore();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedDateRoutes, setSelectedDateRoutes] = useState<AllRoutes[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const { fetchAllJobs } = useJobsStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleDateChange = async (date: Dayjs | null) => {
    setSelectedDate(date);
    if (date) {
      setIsLoadingRoutes(true);
      try {
        const formattedDate = date.format("YYYY-MM-DD");
        const routes = await fetchRoutes(undefined, formattedDate);
        setSelectedDateRoutes(routes);
      } catch (error) {
        console.error("Failed to fetch routes for date:", error);
      } finally {
        setIsLoadingRoutes(false);
      }
    } else {
      setSelectedDateRoutes([]);
    }
  };

  const data = dashboardData ?? defaultDashboard;
  const { kpi, optimization_impact, recent_routes, top_drivers, upcoming } =
    data;

  const quickActions = [
    {
      icon: <FileAddOutlined />,
      label: "Add Job",
      onClick: () => setIsAddJobModalOpen(true),
    },
    {
      icon: <RocketOutlined />,
      label: "Plan Route",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("jobs");
      },
    },
    {
      icon: <TeamOutlined />,
      label: "All Members",
      onClick: () => {
        router.push("/team");
        setCurrentTab("team");
      },
    },
    {
      icon: <EnvironmentOutlined />,
      label: "All Routes",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("routes");
      },
    },
    {
      icon: <FileTextOutlined />,
      label: "All Jobs",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("jobs");
      },
    },
    {
      icon: <CalendarOutlined />,
      label: "Schedule",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("schedule");
      },
    },
  ];

  const getStatusStrokeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "in_transit":
        return "#3b82f6";
      default:
        return "#d1d5db";
    }
  };

  const kpiCards = [
    {
      label: "Active Routes",
      value: kpi.active_routes,
      icon: <CarOutlined />,
      bg: "#f0fdf4",
      color: "#16a34a",
      badge: "Live",
      badgeColor: "#dcfce7",
      badgeText: "#15803d",
    },
    {
      label: "Total Jobs",
      value: kpi.total_jobs.toLocaleString(),
      icon: <FileTextOutlined />,
      bg: "#eff6ff",
      color: "#2563eb",
      badge: "All time",
      badgeColor: "#dbeafe",
      badgeText: "#1d4ed8",
    },
    {
      label: "Completed",
      value: kpi.completed_jobs,
      icon: <CheckCircleOutlined />,
      bg: "#f0fdf4",
      color: "#16a34a",
      badge: `${kpi.total_jobs > 0 ? ((kpi.completed_jobs / kpi.total_jobs) * 100).toFixed(1) : 0}%`,
      badgeColor: "#dcfce7",
      badgeText: "#15803d",
    },
    {
      label: "Scheduled",
      value: kpi.scheduled_jobs,
      icon: <ClockCircleOutlined />,
      bg: "#fef3c7",
      color: "#b45309",
      badge: "Pending",
      badgeColor: "#fef3c7",
      badgeText: "#b45309",
    },
    {
      label: "Drivers",
      value: kpi.total_drivers,
      icon: <TeamOutlined />,
      bg: "#f3f4f6",
      color: "#374151",
      badge: "Active",
      badgeColor: "#f3f4f6",
      badgeText: "#374151",
    },
    {
      label: "Depots",
      value: kpi.total_depots,
      icon: <EnvironmentOutlined />,
      bg: "#f3f4f6",
      color: "#374151",
      badge: "Locations",
      badgeColor: "#f3f4f6",
      badgeText: "#374151",
    },
  ];

  const statusStyleMap: Record<string, { bg: string; color: string }> = {
    completed: { bg: "#dcfce7", color: "#15803d" },
    in_transit: { bg: "#dbeafe", color: "#1d4ed8" },
    scheduled: { bg: "#f3f4f6", color: "#374151" },
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
          <Spin size="large" />
        </div>
      )}

      {/* Title row */}
      <Flex justify="space-between" align="center">
        <Title className="m-0 mb-2 pt-2" level={5}>
          Dashboard
        </Title>
        {error && <Text type="danger">{error}</Text>}
      </Flex>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3 mb-3 flex-shrink-0">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="flex flex-col items-center text-center p-3 bg-white border-[1.5px] border-gray-100"
          >
            <div
              className="w-7 h-7 flex items-center justify-center mb-1.5 text-sm"
              style={{ background: k.bg, color: k.color, borderRadius: 7 }}
            >
              {k.icon}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              {k.label}
            </span>
            <span className="text-xl font-semibold text-gray-900 leading-tight mt-0.5">
              {k.value}
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 mt-1"
              style={{
                background: k.badgeColor,
                color: k.badgeText,
                borderRadius: 4,
              }}
            >
              {k.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="flex gap-3 mb-3 h-[220px] flex-shrink-0">
        {/* Quick Actions */}
        <div className="bg-gray-50 border border-gray-100 p-3 w-[360px] flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            <ThunderboltOutlined /> Quick Actions
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white border border-gray-200 cursor-pointer font-[inherit] transition-all duration-150 hover:bg-green-50 hover:border-green-300 hover:-translate-y-px"
              >
                <span className="text-gray-800 text-lg">{action.icon}</span>
                <span className="text-[11px] font-medium text-gray-500">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Optimization Impact */}
        <div className="bg-gray-50 border border-gray-100 p-3 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex-shrink-0">
            <DashboardOutlined /> Optimization Impact
          </div>
          <div className="grid grid-cols-3 gap-2.5 flex-1">
            {[
              {
                icon: (
                  <DashboardOutlined
                    style={{ fontSize: 20, color: "#4ade80" }}
                  />
                ),
                value:
                  optimization_impact.total_distance_saved_km.toLocaleString(),
                unit: "KM SAVED",
                sub: "Distance reduction",
              },
              {
                icon: (
                  <FieldTimeOutlined
                    style={{ fontSize: 20, color: "#4ade80" }}
                  />
                ),
                value: optimization_impact.total_time_saved_hours,
                unit: "HRS SAVED",
                sub: "Time reduction",
              },
              {
                icon: (
                  <CarOutlined style={{ fontSize: 20, color: "#4ade80" }} />
                ),
                value: optimization_impact.vehicles_saved,
                unit: "VEHICLES SAVED",
                sub: "Fleet efficiency",
              },
            ].map((item) => (
              <div
                key={item.unit}
                className="flex flex-col items-center justify-center text-center p-3 bg-white border border-gray-100"
              >
                <div className="mb-1">{item.icon}</div>
                <div className="text-xl font-semibold text-gray-900">
                  {item.value}
                </div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {item.unit}
                </div>
                <div className="text-[10px] text-gray-400">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-gray-50 border border-gray-100 p-3 w-[240px] flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <CalendarOutlined /> Upcoming
            </span>
            <DatePicker
              size="small"
              onChange={handleDateChange}
              value={selectedDate}
              placeholder="Select Date"
              style={{ width: 110, fontWeight: "normal" }}
              allowClear
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {selectedDate ? (
              isLoadingRoutes ? (
                <div className="flex justify-center py-4">
                  <Spin size="small" />
                </div>
              ) : selectedDateRoutes.length === 0 ? (
                <span className="text-xs text-gray-400">
                  No routes for {selectedDate.format("MMM D")}
                </span>
              ) : (
                selectedDateRoutes.map((route: AllRoutes) => (
                  <div
                    key={route.id}
                    className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div
                        className="text-xs font-medium text-blue-700 cursor-pointer"
                        onClick={() =>
                          router.push(`/route/${route.optimization_id}`)
                        }
                      >
                        {route.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {route.total_stops} stops
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-600">
                      {route.status.replace("_", " ")}
                    </span>
                  </div>
                ))
              )
            ) : upcoming.length === 0 ? (
              <span className="text-xs text-gray-400">
                No upcoming schedule
              </span>
            ) : (
              upcoming.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <div className="text-xs font-semibold text-gray-800">
                      {item.date}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {item.jobs} jobs · {item.routes} routes
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {item.jobs}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Recent Routes */}
        <div className="flex flex-col flex-1 bg-gray-50 border border-gray-100 p-3 overflow-hidden">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex-shrink-0">
            <CarOutlined /> Recent Routes
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {["Route", "Driver", "Progress", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-2 py-1.5 border-b border-gray-200 bg-gray-50 sticky top-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent_routes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-4 text-xs text-gray-400">
                      No routes yet
                    </td>
                  </tr>
                ) : (
                  recent_routes.map((route: RecentRoute) => {
                    const pct =
                      route.stops > 0
                        ? Math.min(
                            100,
                            Math.round((route.completed / route.stops) * 100),
                          )
                        : 0;
                    const statusStyle =
                      statusStyleMap[route.status] ?? statusStyleMap.scheduled;
                    return (
                      <tr
                        key={route.key}
                        className="transition-colors duration-100 hover:bg-gray-100"
                      >
                        <td className="px-2 py-2 border-b border-gray-100">
                          <span
                            className="text-blue-700 font-medium cursor-pointer text-xs"
                            onClick={() => router.push(`/route/${route.key}`)}
                          >
                            {route.name}
                          </span>
                        </td>
                        <td className="px-2 py-2 border-b border-gray-100 text-gray-500 text-xs">
                          {route.driver}
                        </td>
                        <td className="px-2 py-2 border-b border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="bg-gray-200 h-1 w-14 overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  background: getStatusStrokeColor(
                                    route.status,
                                  ),
                                  width: `${pct}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {route.completed}/{route.stops}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 border-b border-gray-100">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          >
                            {route.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Drivers */}
        <div className="flex flex-col bg-gray-50 border border-gray-100 p-3 w-[240px] flex-shrink-0 overflow-hidden">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex-shrink-0">
            <UserOutlined /> Top Drivers
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {top_drivers.length === 0 ? (
              <span className="text-xs text-gray-400">No driver data yet</span>
            ) : (
              top_drivers.map((driver, index) => {
                const avatarColors = [
                  { bg: "#1a1a2e", color: "#4ade80" },
                  { bg: "#374151", color: "#d1fae5" },
                  { bg: "#6b7280", color: "#f9fafb" },
                ];
                const av = avatarColors[index] ?? avatarColors[2];
                const initials = driver.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2.5 py-2.5 ${index < top_drivers.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: av.bg, color: av.color }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {driver.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {driver.completion_rate}% completion
                      </div>
                      <div className="bg-gray-200 h-0.5 w-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-green-400"
                          style={{
                            width: `${Math.min(100, driver.completion_rate)}%`,
                          }}
                        />
                      </div>
                    </div>
                    {/* On-time ring */}
                    <div className="relative w-9 h-9 flex-shrink-0">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        className="-rotate-90"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${(driver.on_time_rate / 100) * 87.96} 87.96`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold text-gray-600">
                        {driver.on_time_rate}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AddJobsModal
        open={isAddJobModalOpen}
        setOpen={setIsAddJobModalOpen}
        onJobCreated={() => {
          fetchDashboard();
          fetchAllJobs();
        }}
      />
    </div>
  );
}
