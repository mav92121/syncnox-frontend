"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Flex,
  Table,
  Progress,
  Tag,
  Avatar,
  Space,
  Spin,
} from "antd";
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
import {
  useDashboardStore,
  defaultDashboard,
} from "@/store/dashboard.store";
import { RecentRoute } from "@/types/dashboard.type";

const { Title, Text } = Typography;

export default function DashboardView() {
  const router = useRouter();
  const { setCurrentTab } = useIndexStore();
  const { dashboardData, isLoading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const data = dashboardData ?? defaultDashboard;
  const { kpi, optimization_impact, recent_routes, top_drivers, upcoming } =
    data;

  const quickActions = [
    {
      icon: <FileAddOutlined style={{ fontSize: 20 }} />,
      label: "Add Job",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("add-jobs");
      },
    },
    {
      icon: <RocketOutlined style={{ fontSize: 20 }} />,
      label: "Plan Route",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("unassigned-jobs");
      },
    },
    {
      icon: <TeamOutlined style={{ fontSize: 20 }} />,
      label: "All Members",
      onClick: () => {
        router.push("/team");
        setCurrentTab("team");
      },
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 20 }} />,
      label: "All Routes",
      onClick: () => {
        setCurrentTab("routes");
      },
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 20 }} />,
      label: "All Jobs",
      onClick: () => {
        setCurrentTab("jobs");
      },
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 20 }} />,
      label: "Schedule",
      onClick: () => {
        setCurrentTab("schedule");
      },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_transit":
        return "processing";
      case "scheduled":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusStrokeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#52c41a";
      case "in_transit":
        return "#1890ff";
      case "scheduled":
        return "#d9d9d9";
      default:
        return "#d9d9d9";
    }
  };

  const routeColumns = [
    {
      title: "Route",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    { title: "Driver", dataIndex: "driver", key: "driver" },
    {
      title: "Progress",
      key: "progress",
      width: 140,
      render: (_: unknown, record: RecentRoute) => (
        <Flex align="center" gap={8}>
          <Progress
            percent={
              record.stops > 0
                ? Math.round((record.completed / record.stops) * 100)
                : 0
            }
            size="small"
            strokeColor={getStatusStrokeColor(record.status)}
            style={{ width: 60, marginBottom: 0 }}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.completed}/{record.stops}
          </Text>
        </Flex>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.replace("_", " ")}</Tag>
      ),
    },
  ];

  return (
    <Spin spinning={isLoading} size="large">
      <div className="flex flex-col h-full">
        <Title level={4} className="m-0 mb-4">
          Dashboard
        </Title>

        {/* KPI Cards Row */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" styles={{ body: { padding: 16 } }}>
              <Statistic
                title="Total Jobs"
                value={kpi.total_jobs}
                prefix={<FileTextOutlined style={{ color: "#333" }} />}
                styles={{ content: { color: "#333" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" styles={{ body: { padding: 16 } }}>
              <Statistic
                title="Active Routes"
                value={kpi.active_routes}
                prefix={<CarOutlined style={{ color: "#333" }} />}
                styles={{ content: { color: "#333" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" styles={{ body: { padding: 16 } }}>
              <Statistic
                title="Completed"
                value={kpi.completed_jobs}
                prefix={<CheckCircleOutlined style={{ color: "#333" }} />}
                styles={{ content: { color: "#333" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" styles={{ body: { padding: 16 } }}>
              <Statistic
                title="Scheduled"
                value={kpi.scheduled_jobs}
                prefix={<ClockCircleOutlined style={{ color: "#333" }} />}
                styles={{ content: { color: "#333" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" styles={{ body: { padding: 16 } }}>
              <Statistic
                title="Drivers"
                value={kpi.total_drivers}
                prefix={<TeamOutlined style={{ color: "#333" }} />}
                styles={{ content: { color: "#333" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" styles={{ body: { padding: 16 } }}>
              <Statistic
                title="Depots"
                value={kpi.total_depots}
                prefix={<EnvironmentOutlined style={{ color: "#333" }} />}
                styles={{ content: { color: "#333" } }}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions + Optimization Impact Row */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={14}>
            <Card
              size="small"
              title={
                <Flex align="center" gap={8}>
                  <ThunderboltOutlined style={{ color: "#333" }} />
                  Quick Actions
                </Flex>
              }
              styles={{ body: { padding: 16 } }}
            >
              <Flex gap={16} wrap="wrap">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={action.onClick}
                    style={{
                      width: 100,
                      height: 80,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#fafafa",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fafafa";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{ color: "#333", marginBottom: 6 }}>
                      {action.icon}
                    </span>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#333",
                        fontWeight: 500,
                      }}
                    >
                      {action.label}
                    </Text>
                  </div>
                ))}
              </Flex>
            </Card>
          </Col>
          <Col span={10}>
            <Card
              size="small"
              title={
                <Flex align="center" gap={8}>
                  <DashboardOutlined style={{ color: "#333" }} />
                  Optimization Impact
                </Flex>
              }
              styles={{ body: { padding: 16 } }}
            >
              <Flex justify="space-around">
                <div className="text-center">
                  <DashboardOutlined
                    style={{ color: "#333", fontSize: 24 }}
                  />
                  <Text
                    style={{
                      display: "block",
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {optimization_impact.total_distance_saved_km} km
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Distance Saved
                  </Text>
                </div>
                <div className="text-center">
                  <FieldTimeOutlined
                    style={{ color: "#333", fontSize: 24 }}
                  />
                  <Text
                    style={{
                      display: "block",
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {optimization_impact.total_time_saved_hours} hrs
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Time Saved
                  </Text>
                </div>
                <div className="text-center">
                  <CarOutlined style={{ color: "#333", fontSize: 24 }} />
                  <Text
                    style={{
                      display: "block",
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {optimization_impact.vehicles_saved}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Vehicles Saved
                  </Text>
                </div>
              </Flex>
            </Card>
          </Col>
        </Row>

        {/* Bottom Section - Tables and Cards */}
        <Row gutter={[16, 16]} className="flex-1 min-h-0">
          <Col span={12}>
            <Card
              size="small"
              title={
                <Flex align="center" gap={8}>
                  <CarOutlined style={{ color: "#333" }} />
                  Recent Routes
                </Flex>
              }
              styles={{ body: { padding: 0 } }}
              style={{ height: "100%" }}
            >
              <Table
                dataSource={recent_routes}
                columns={routeColumns}
                pagination={false}
                size="small"
                locale={{ emptyText: "No routes yet" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              size="small"
              title={
                <Flex align="center" gap={8}>
                  <UserOutlined style={{ color: "#333" }} />
                  Top Drivers
                </Flex>
              }
              styles={{ body: { padding: 12 } }}
              style={{ height: "100%" }}
            >
              {top_drivers.length === 0 ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  No driver data yet
                </Text>
              ) : (
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size={12}
                >
                  {top_drivers.map((driver, index) => (
                    <Flex key={index} justify="space-between" align="center">
                      <Flex align="center" gap={8}>
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor:
                              index === 0
                                ? "#333"
                                : index === 1
                                  ? "#666"
                                  : "#999",
                          }}
                        />
                        <div>
                          <Text
                            strong
                            style={{ fontSize: 12, display: "block" }}
                          >
                            {driver.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 10 }}>
                            {driver.completion_rate}% completion
                          </Text>
                        </div>
                      </Flex>
                      <Progress
                        type="circle"
                        percent={driver.on_time_rate}
                        size={28}
                        strokeColor="#333"
                        format={(p) => (
                          <span style={{ fontSize: 8 }}>{p}%</span>
                        )}
                      />
                    </Flex>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
          <Col span={6}>
            <Card
              size="small"
              title={
                <Flex align="center" gap={8}>
                  <CalendarOutlined style={{ color: "#333" }} />
                  Upcoming
                </Flex>
              }
              styles={{ body: { padding: 12 } }}
              style={{ height: "100%" }}
            >
              {upcoming.length === 0 ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  No upcoming schedule
                </Text>
              ) : (
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size={12}
                >
                  {upcoming.map((item, index) => (
                    <Flex
                      key={index}
                      justify="space-between"
                      align="center"
                      style={{
                        padding: "8px 0",
                        borderBottom:
                          index < upcoming.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                      }}
                    >
                      <div>
                        <Text strong style={{ fontSize: 12 }}>
                          {item.date}
                        </Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: 10, display: "block" }}
                        >
                          {item.jobs} jobs &bull; {item.routes} routes
                        </Text>
                      </div>
                      <Tag color="default">{item.jobs}</Tag>
                    </Flex>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
