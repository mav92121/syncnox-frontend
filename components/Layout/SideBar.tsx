"use client";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, Modal, Typography } from "antd";
import { UserOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import { TabKey, useIndexStore } from "@/store/index.store";
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
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { user, clearUser, setCurrentTab, setSidebarNavigation } =
    useIndexStore();

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  // Check if any sub-item is active
  const hasActiveSubItem = useCallback(
    (subItems?: { path: string }[]) => {
      return subItems?.some((sub) => pathname === sub.path) ?? false;
    },
    [pathname]
  );

  const handleNavigation = useCallback(
    (path: string, tabKey: TabKey) => {
      if (pathname === path) {
        setCurrentTab(tabKey);
      } else {
        setSidebarNavigation(true);
      }
    },
    [pathname, setCurrentTab, setSidebarNavigation]
  );

  const handleMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsExpanded(true);

    // Auto-open submenu if a sub-item is currently active
    const activeParentMenu = MENU_ITEMS.find(
      (item) =>
        item.subItems && item.subItems.some((sub) => pathname === sub.path)
    );
    if (activeParentMenu) {
      setHoveredMenu(activeParentMenu.path);
    }
  }, [pathname]);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      setHoveredMenu(null);
    }, HOVER_CLOSE_DELAY);
  }, []);

  const handleMenuItemHover = useCallback((path: string | null) => {
    if (subMenuTimerRef.current) {
      clearTimeout(subMenuTimerRef.current);
      subMenuTimerRef.current = null;
    }
    setHoveredMenu(path);
  }, []);

  const handleMenuItemLeave = useCallback(() => {
    subMenuTimerRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 150);
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
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (subMenuTimerRef.current) clearTimeout(subMenuTimerRef.current);
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

  const getMenuItemClasses = (path: string, hasActiveSub = false) => {
    const active = isActive(path);
    if (active) {
      return "w-full flex items-center py-2.5 transition-all duration-200 cursor-pointer bg-primary text-white";
    }
    if (hasActiveSub) {
      // Parent has an active sub-item - show subtle indication
      return "w-full flex items-center py-2.5 transition-all duration-200 cursor-pointer bg-gray-100 text-gray-700";
    }
    return "w-full flex items-center py-2.5 transition-all duration-200 cursor-pointer hover:bg-gray-50 text-gray-700";
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
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const activeSub = hasActiveSubItem(item.subItems);
          const active = isActive(item.path) || activeSub;
          const Icon = item.icon;
          const isSubmenuOpen = hoveredMenu === item.path;

          return (
            <div
              key={item.path}
              className="mb-1"
              onMouseEnter={() => hasSubItems && handleMenuItemHover(item.path)}
              onMouseLeave={() => hasSubItems && handleMenuItemLeave()}
            >
              {hasSubItems ? (
                // Menu item with sub-items (accordion on hover)
                <>
                  <button className={getMenuItemClasses(item.path, activeSub)}>
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
                    {isExpanded && (
                      <span
                        className={`ml-auto mr-3 ${
                          active ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {isSubmenuOpen ? (
                          <UpOutlined style={{ fontSize: 10 }} />
                        ) : (
                          <DownOutlined style={{ fontSize: 10 }} />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Sub-items (accordion style on hover) */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isSubmenuOpen && isExpanded
                        ? "max-h-48 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.subItems!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const subActive = isActive(subItem.path);
                      return (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          onClick={() =>
                            handleNavigation(subItem.path, subItem.tabKey)
                          }
                        >
                          <div
                            className={`flex items-center py-2 pl-11 pr-3 text-sm cursor-pointer transition-colors ${
                              subActive
                                ? "bg-primary text-white"
                                : "hover:bg-gray-50 text-gray-600"
                            }`}
                          >
                            <SubIcon
                              className={`mr-2 text-sm ${
                                subActive ? "text-white" : ""
                              }`}
                            />
                            {subItem.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                // Regular menu item with navigation
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
              )}
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
