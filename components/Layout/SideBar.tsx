"use client";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, Modal, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { TabKey, useIndexStore } from "@/zustand/index.store";
import { signOut } from "next-auth/react";
import { HOVER_CLOSE_DELAY, MENU_ITEMS } from "./sidebar.constants";

const { Title } = Typography;

interface BottomMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action?: () => void;
  isDanger?: boolean;
}

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { user, clearUser, setCurrentTab } = useIndexStore();

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  const handleNavigation = useCallback(
    (path: string, tabKey: TabKey) => {
      if (pathname === path) {
        setCurrentTab(tabKey);
      }
    },
    [pathname, setCurrentTab]
  );

  const handleMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, HOVER_CLOSE_DELAY);
  }, []);

  const handleLogout = useCallback(() => {
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
          console.error("Logout error:", error);
        }
      },
    });
  }, [clearUser]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const bottomMenuItems: BottomMenuItem[] = [
    {
      icon: (props) => (
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

  const getMenuItemClasses = (path: string) => {
    const active = isActive(path);
    return `w-full flex items-center py-2.5 transition-all duration-200 cursor-pointer ${
      active ? "bg-primary text-white" : "hover:bg-gray-50 text-gray-700"
    }`;
  };

  const getLabelClasses = (active: boolean) =>
    `ml-3 text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
      active ? "font-medium" : ""
    } ${isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}`;

  return (
    <aside
      className={`h-screen bg-white flex flex-col border-r overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      style={{ willChange: "width" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

      {/* Main Menu Items */}
      <nav
        className="flex-1 px-2 overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#E5E7EB transparent",
        }}
      >
        {MENU_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <div key={item.path} className="mb-1">
              <Link
                href={item.path}
                onClick={() => handleNavigation(item.path, item.tabKey)}
              >
                <button className={getMenuItemClasses(item.path)}>
                  <div
                    className={`w-5 h-5 flex items-center justify-center shrink-0 ${
                      active ? "ml-[13px]" : "ml-3"
                    }`}
                  >
                    <Icon
                      className={`text-base ${
                        active ? "text-white text-xl" : ""
                      }`}
                    />
                  </div>
                  <span
                    style={{ transitionProperty: "opacity, max-width" }}
                    className={getLabelClasses(active)}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Bottom Section - User Profile & Actions */}
      <footer className="border-t pt-3 pb-4 px-2">
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
              <p className="text-xs text-gray-500">{user.email}</p>
            )}
          </div>
        </div>

        {/* Bottom Menu Items */}
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center pl-3 py-2.5 transition-all duration-200 cursor-pointer ${
                item.isDanger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <Icon
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
          );
        })}
      </footer>
    </aside>
  );
};

export default SideBar;
