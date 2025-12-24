"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, Modal, Typography } from "antd";
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
import { TabKey, useIndexStore } from "@/zustand/index.store";
import { signOut } from "next-auth/react";

const { Title } = Typography;

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  tabKey: TabKey;
}

interface BottomMenuItem {
  icon: React.ComponentType<any>;
  label: string;
  action?: () => void;
  isDanger?: boolean;
}

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { user, clearUser, setCurrentTab } = useIndexStore();

  const handleNavigation = (path: string, tabKey: TabKey) => {
    if (pathname === path) {
      setCurrentTab(tabKey);
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    Modal.confirm({
      title: <Title level={5}>Confirm Logout</Title>,
      content: "Are you sure you want to logout?",
      okText: "Logout",
      cancelText: "Cancel",
      okType: "danger",
      onOk: async () => {
        try {
          clearUser();
          await signOut({ callbackUrl: "/sign-in" });
        } catch (error) {
          console.log("error -> ", error);
        }
      },
    });
  };

  const menuItems: MenuItem[] = [
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
    {
      icon: UserOutlined,
      label: "Customers",
      path: "/customers",
      tabKey: "api",
    },
  ];

  const bottomMenuItems: BottomMenuItem[] = [
    {
      icon: (props: any) => (
        <Image
          src="/logout.svg"
          alt="Logout"
          width={24}
          height={24}
          {...props}
        />
      ),
      label: "Log out",
      action: handleLogout,
      isDanger: true,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`h-screen bg-white flex flex-col border-r overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      style={{ willChange: "width" }}
      onMouseEnter={() => {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        setIsExpanded(true);
      }}
      onMouseLeave={() => {
        closeTimerRef.current = setTimeout(() => {
          setIsExpanded(false);
        }, 200);
      }}
    >
      {/* Logo Section */}
      <div className="pt-3 px-4 mb-4 h-16 flex items-center">
        <div className="transition-all duration-300 ease-in-out w-full">
          {isExpanded ? (
            <Link
              href="/dashboard"
              onClick={() => handleNavigation("/dashboard", "dashboard")}
            >
              <div className="flex items-center cursor-pointer">
                <Image
                  src="/syncnox.svg"
                  alt="SYNCNOX"
                  width={140}
                  height={38}
                  priority
                />
              </div>
            </Link>
          ) : (
            <div className="flex justify-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={21}
                height={21}
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Menu Items with custom scrollbar */}
      <div
        className="flex-1 px-2 overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#E5E7EB transparent",
        }}
      >
        {menuItems.map((item, index) => (
          <div key={index} className="mb-1">
            {item.label === "Plan" ? (
              <Link
                href={item.path}
                onClick={() => handleNavigation(item.path, item.tabKey)}
              >
                <button className="w-full bg-primary text-white py-2.5 flex items-center transition-all duration-200 hover:opacity-90 cursor-pointer">
                  <div className="w-5 h-5 flex items-center justify-center ml-[13px] shrink-0">
                    <item.icon className="text-xl text-white" />
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
                    }`}
                    style={{ transitionProperty: "opacity, max-width" }}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            ) : (
              <Link
                href={item.path}
                onClick={() => handleNavigation(item.path, item.tabKey)}
              >
                <button
                  className={`w-full flex items-center pl-3 py-2.5 transition-all duration-200 cursor-pointer ${
                    isActive(item.path)
                      ? "bg-[#F6FFED] text-primary"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <item.icon className="text-base" />
                  </div>
                  <span
                    className={`ml-3 text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
                    }`}
                    style={{ transitionProperty: "opacity, max-width" }}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Section - User Profile & Actions */}
      <div className="border-t pt-3 pb-4 px-2">
        {/* User Profile */}
        <div
          className={`flex items-center pl-1 mb-3 cursor-pointer ${
            isExpanded ? "" : "justify-center"
          }`}
        >
          <Avatar size={32} icon={<UserOutlined />} className="shrink-0" />
          <div
            className={`ml-2 overflow-hidden transition-all duration-300 ${
              isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
            }`}
            style={{ transitionProperty: "opacity, max-width" }}
          >
            <p className="text-xs text-gray-700">Admin</p>
            {user?.email && (
              <p className="text-xs text-gray-500">{user?.email}</p>
            )}
          </div>
        </div>

        {/* Bottom Menu Items */}
        {bottomMenuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={`w-full flex items-center pl-3 py-2.5 transition-all duration-200 cursor-pointer ${
              item.isDanger
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <item.icon
                className={`text-base ${item.isDanger ? "text-red-600" : ""}`}
              />
            </div>
            <span
              className={`ml-3 text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
              }`}
              style={{ transitionProperty: "opacity, max-width" }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
