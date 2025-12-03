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
  queryValue: string;
}

export interface RouteTabConfig {
  [route: string]: {
    queryParam: string;
    tabs: NavTab[];
  };
}

// Configuration mapping routes to their respective tabs
export const routeTabsConfig: RouteTabConfig = {
  "/dashboard": {
    queryParam: "tab",
    tabs: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: DashboardOutlined,
        queryValue: "dashboard",
      },
      {
        key: "routes",
        label: "Routes",
        icon: EnvironmentOutlined,
        queryValue: "routes",
      },
      {
        key: "jobs",
        label: "Jobs",
        icon: FileTextOutlined,
        queryValue: "jobs",
      },
      {
        key: "schedule",
        label: "Schedule",
        icon: CalendarOutlined,
        queryValue: "schedule",
      },
    ],
  },
  "/plan": {
    queryParam: "tab",
    tabs: [
      {
        key: "plan",
        label: "Plan",
        icon: UnorderedListOutlined,
        queryValue: "plan",
      },
      {
        key: "recents",
        label: "Recents",
        icon: ClockCircleOutlined,
        queryValue: "recents",
      },
    ],
  },
  "/insights": {
    queryParam: "tab",
    tabs: [
      {
        key: "team",
        label: "Team Insights",
        icon: TeamOutlined,
        queryValue: "team",
      },
      {
        key: "vehicle",
        label: "Vehicle Insights",
        icon: CarOutlined,
        queryValue: "vehicle",
      },
    ],
  },
  "/schedule": {
    queryParam: "tab",
    tabs: [
      {
        key: "optimization",
        label: "Optimization",
        icon: RocketOutlined,
        queryValue: "optimization",
      },
      {
        key: "reports",
        label: "Reports",
        icon: BarChartOutlined,
        queryValue: "reports",
      },
      { key: "api", label: "API", icon: ApiOutlined, queryValue: "api" },
    ],
  },
  "/analytics": {
    queryParam: "tab",
    tabs: [
      {
        key: "team",
        label: "Team Insights",
        icon: TeamOutlined,
        queryValue: "team",
      },
      {
        key: "vehicle",
        label: "Vehicle Insights",
        icon: CarOutlined,
        queryValue: "vehicle",
      },
    ],
  },
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

/**
 * Get the active tab based on current query parameter
 * @param queryParam - Query parameter name (e.g., "tab")
 * @param queryValue - Current query parameter value
 * @param tabs - Array of tabs
 * @returns Active tab or the first tab as default
 */
export const getActiveTab = (
  queryParam: string,
  queryValue: string | null,
  tabs: NavTab[]
): NavTab => {
  if (!queryValue) {
    // Default to first tab if no query param
    return tabs[0];
  }

  // Find tab matching the query value
  const match = tabs.find((tab) => tab.queryValue === queryValue);
  return match || tabs[0];
};
