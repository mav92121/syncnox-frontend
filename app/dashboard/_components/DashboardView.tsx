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
  const { currentTab, setCurrentTab } = useIndexStore();
  console.log("cur -> ", currentTab);

  const quickActions = [
    {
      icon: <FileAddOutlined style={{ fontSize: 20 }} />,
      label: "Add Job",
      color: "#003220",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("add-jobs");
      },
    },
    {
      icon: <RocketOutlined style={{ fontSize: 20 }} />,
      label: "Plan Route",
      color: "#1890ff",
      onClick: () => {
        router.push("/plan");
        setCurrentTab("unassigned-jobs");
      },
    },
    {
      icon: <TeamOutlined style={{ fontSize: 20 }} />,
      label: "Add Driver",
      color: "#722ed1",
      onClick: () => {
        router.push("/team");
        setCurrentTab("team");
      },
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 20 }} />,
      label: "All Routes",
      color: "#fa8c16",
      onClick: () => {
        setCurrentTab("routes");
      },
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 20 }} />,
      label: "All Jobs",
      color: "#52c41a",
      onClick: () => {
        setCurrentTab("jobs");
      },
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 20 }} />,
      label: "Schedule",
      color: "#eb2f96",
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
            strokeColor="#003220"
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
              prefix={<FileTextOutlined style={{ color: "#003220" }} />}
              valueStyle={{ color: "#003220" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Active Routes"
              value={0}
              prefix={<CarOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Completed"
              value={0}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Scheduled"
              value={0}
              prefix={<ClockCircleOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Drivers"
              value={0}
              prefix={<TeamOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Depots"
              value={0}
              prefix={<EnvironmentOutlined style={{ color: "#eb2f96" }} />}
              valueStyle={{ color: "#eb2f96" }}
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
                <ThunderboltOutlined style={{ color: "#003220" }} />
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
                    borderRadius: 8,
                    border: `1px solid ${action.color}30`,
                    backgroundColor: `${action.color}08`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${action.color}15`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${action.color}08`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ color: action.color, marginBottom: 6 }}>
                    {action.icon}
                  </span>
                  <Text
                    style={{
                      fontSize: 11,
                      color: action.color,
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
                <DashboardOutlined style={{ color: "#003220" }} />
                Optimization Impact
              </Flex>
            }
            styles={{ body: { padding: 16 } }}
          >
            <Flex justify="space-around">
              <div className="text-center">
                <DashboardOutlined style={{ color: "#52c41a", fontSize: 24 }} />
                <Text
                  style={{
                    display: "block",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#52c41a",
                  }}
                >
                  0 km
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Distance Saved
                </Text>
              </div>
              <div className="text-center">
                <FieldTimeOutlined style={{ color: "#1890ff", fontSize: 24 }} />
                <Text
                  style={{
                    display: "block",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  0 hrs
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Time Saved
                </Text>
              </div>
              <div className="text-center">
                <CarOutlined style={{ color: "#fa8c16", fontSize: 24 }} />
                <Text
                  style={{
                    display: "block",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#fa8c16",
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
                <CarOutlined style={{ color: "#003220" }} />
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
                <UserOutlined style={{ color: "#003220" }} />
                Top Drivers
              </Flex>
            }
            styles={{ body: { padding: 12 } }}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              {mockDrivers.map((driver, index) => (
                <Flex key={index} justify="space-between" align="center">
                  <Flex align="center" gap={8}>
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor:
                          index === 0
                            ? "#003220"
                            : index === 1
                            ? "#52c41a"
                            : "#1890ff",
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
                    strokeColor="#003220"
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
                <CalendarOutlined style={{ color: "#003220" }} />
                Upcoming
              </Flex>
            }
            styles={{ body: { padding: 12 } }}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
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
