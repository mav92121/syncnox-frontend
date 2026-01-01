import { TabKey } from "@/zustand/index.store";
import {
  RocketOutlined,
  BarChartOutlined,
  CalendarOutlined,
  LineChartOutlined,
  AimOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  CarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

interface SubMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  tabKey: TabKey;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  tabKey: TabKey;
  subItems?: SubMenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: RocketOutlined,
    label: "Plan",
    path: "/plan",
    tabKey: "unassigned-jobs",
  },
  {
    icon: BarChartOutlined,
    label: "Insights",
    path: "/insights",
    tabKey: "team",
  },
  {
    icon: LineChartOutlined,
    label: "Analytics",
    path: "/analytics",
    tabKey: "optimization",
  },
  {
    icon: AimOutlined,
    label: "Live Tracking & Alerts",
    path: "/tracking",
    tabKey: "routes",
  },
  {
    icon: UserOutlined,
    label: "Customers",
    path: "/customers",
    tabKey: "api",
  },
  {
    icon: SettingOutlined,
    label: "Settings",
    path: "/settings",
    tabKey: "team",
    subItems: [
      { icon: TeamOutlined, label: "Team", path: "/team", tabKey: "team" },
      {
        icon: CarOutlined,
        label: "Vehicle",
        path: "/vehicle",
        tabKey: "vehicle",
      },
      {
        icon: EnvironmentOutlined,
        label: "Depot",
        path: "/depot",
        tabKey: "depot",
      },
    ],
  },
];

export const HOVER_CLOSE_DELAY = 200;
