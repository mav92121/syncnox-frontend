import Image from "next/image";
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
} from "@ant-design/icons";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  tabKey: TabKey;
}

interface BottomMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action?: () => void;
  isDanger?: boolean;
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
    icon: CalendarOutlined,
    label: "Schedule",
    path: "/schedule",
    tabKey: "schedule",
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
    icon: SettingOutlined,
    label: "Settings",
    path: "/settings",
    tabKey: "reports",
  },
  { icon: TeamOutlined, label: "Team", path: "/team", tabKey: "team" },
  { icon: UserOutlined, label: "Customers", path: "/customers", tabKey: "api" },
];

export const HOVER_CLOSE_DELAY = 200;
