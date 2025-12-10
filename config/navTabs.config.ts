import { ComponentType } from "react";
import {
  DashboardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CarOutlined,
  RocketOutlined,
  BarChartOutlined,
  ApiOutlined,
} from "@ant-design/icons";

// Icon props interface to support className and other common props
export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface NavTab {
  key: string;
  label: string;
  icon?: ComponentType<IconProps>;
}

export interface RouteTabConfig {
  [route: string]: NavTab[];
}

// Configuration mapping routes to their respective tabs
export const routeTabsConfig: RouteTabConfig = {
  "/dashboard": [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: DashboardOutlined,
    },
    {
      key: "routes",
      label: "Routes",
      icon: EnvironmentOutlined,
    },
    {
      key: "jobs",
      label: "Jobs",
      icon: FileTextOutlined,
    },
    {
      key: "schedule",
      label: "Schedule",
      icon: CalendarOutlined,
    },
  ],
  "/plan": [
    {
      key: "plan",
      label: "Plan",
      icon: UnorderedListOutlined,
    },
    {
      key: "recents",
      label: "Recents",
      icon: ClockCircleOutlined,
    },
  ],
  "/insights": [
    {
      key: "team",
      label: "Team Insights",
      icon: TeamOutlined,
    },
    {
      key: "vehicle",
      label: "Vehicle Insights",
      icon: CarOutlined,
    },
  ],
  "/schedule": [
    {
      key: "optimization",
      label: "Optimization",
      icon: RocketOutlined,
    },
    {
      key: "reports",
      label: "Reports",
      icon: BarChartOutlined,
    },
    {
      key: "api",
      label: "API",
      icon: ApiOutlined,
    },
  ],
  "/analytics": [
    {
      key: "team",
      label: "Team Insights",
      icon: TeamOutlined,
    },
    {
      key: "vehicle",
      label: "Vehicle Insights",
      icon: CarOutlined,
    },
  ],
  "/team": [
    {
      key: "team",
      label: "Team",
      icon: TeamOutlined,
    },
  ],
};

/**
 * Get tabs configuration for a specific route
 * @param pathname - Current pathname
 * @returns Tabs configuration for the route, or null if no tabs configured
 */
export const getTabsConfigForRoute = (pathname: string) => {
  // Find the base route (first segment after /)
  const baseRoute = "/" + pathname.split("/").filter(Boolean)[0];
  return routeTabsConfig[baseRoute] || null;
};
