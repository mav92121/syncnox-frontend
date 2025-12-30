"use client";
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
} from "antd";
import {
  FileTextOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileAddOutlined,
  RocketOutlined,
  SendOutlined,
  TeamOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { useIndexStore } from "@/zustand/index.store";

const { Title, Text } = Typography;

// Mock data
const mockRecentRoutes = [
  {
    key: "1",
    name: "Downtown Deliveries",
    driver: "John Smith",
    stops: 12,
    completed: 10,
    status: "in_progress",
  },
  {
    key: "2",
    name: "Suburb Express",
    driver: "Sarah Johnson",
    stops: 8,
    completed: 8,
    status: "completed",
  },
  {
    key: "3",
    name: "Industrial Zone",
    driver: "Mike Chen",
    stops: 15,
    completed: 7,
    status: "in_progress",
  },
  {
    key: "4",
    name: "Airport Pickups",
    driver: "Lisa Park",
    stops: 6,
    completed: 0,
    status: "scheduled",
  },
];

const mockDrivers = [
  { name: "John Smith", completionRate: 98, onTime: 96 },
  { name: "Sarah Johnson", completionRate: 95, onTime: 94 },
  { name: "Mike Chen", completionRate: 92, onTime: 89 },
];

const mockUpcoming = [
  { date: "Dec 29", jobs: 18, routes: 3 },
  { date: "Dec 30", jobs: 24, routes: 4 },
  { date: "Dec 31", jobs: 12, routes: 2 },
];

export default function DashboardView() {
  const router = useRouter();
  const { setCurrentTab } = useIndexStore();

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
      label: "Add Driver",
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
      case "in_progress":
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
      case "in_progress":
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
      render: (_: unknown, record: (typeof mockRecentRoutes)[0]) => (
        <Flex align="center" gap={8}>
          <Progress
            percent={Math.round((record.completed / record.stops) * 100)}
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
              value={0}
              prefix={<FileTextOutlined style={{ color: "#333" }} />}
              styles={{ content: { color: "#333" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Active Routes"
              value={0}
              prefix={<CarOutlined style={{ color: "#333" }} />}
              styles={{ content: { color: "#333" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Completed"
              value={0}
              prefix={<CheckCircleOutlined style={{ color: "#333" }} />}
              styles={{ content: { color: "#333" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Scheduled"
              value={0}
              prefix={<ClockCircleOutlined style={{ color: "#333" }} />}
              styles={{ content: { color: "#333" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Drivers"
              value={0}
              prefix={<TeamOutlined style={{ color: "#333" }} />}
              styles={{ content: { color: "#333" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Depots"
              value={0}
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
                <DashboardOutlined style={{ color: "#333", fontSize: 24 }} />
                <Text
                  style={{
                    display: "block",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  0 km
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Distance Saved
                </Text>
              </div>
              <div className="text-center">
                <FieldTimeOutlined style={{ color: "#333", fontSize: 24 }} />
                <Text
                  style={{
                    display: "block",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  0 hrs
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
                  0
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
              dataSource={mockRecentRoutes}
              columns={routeColumns}
              pagination={false}
              size="small"
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
            <Space orientation="vertical" style={{ width: "100%" }} size={12}>
              {mockDrivers.map((driver, index) => (
                <Flex key={index} justify="space-between" align="center">
                  <Flex align="center" gap={8}>
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor:
                          index === 0 ? "#333" : index === 1 ? "#666" : "#999",
                      }}
                    />
                    <div>
                      <Text strong style={{ fontSize: 12, display: "block" }}>
                        {driver.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {driver.completionRate}% completion
                      </Text>
                    </div>
                  </Flex>
                  <Progress
                    type="circle"
                    percent={driver.onTime}
                    size={28}
                    strokeColor="#333"
                    format={(p) => <span style={{ fontSize: 8 }}>{p}%</span>}
                  />
                </Flex>
              ))}
            </Space>
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
            <Space orientation="vertical" style={{ width: "100%" }} size={12}>
              {mockUpcoming.map((item, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: "8px 0",
                    borderBottom:
                      index < mockUpcoming.length - 1
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
                      {item.jobs} jobs • {item.routes} routes
                    </Text>
                  </div>
                  <Tag color="default">{item.jobs}</Tag>
                </Flex>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
