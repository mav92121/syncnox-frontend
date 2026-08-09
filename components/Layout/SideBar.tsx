"use client";
import Link from "next/link";
import { useCallback } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button, Avatar, Modal, Popover, Typography } from "antd";
import {
  LogoutOutlined,
  MailOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { TabKey, useIndexStore } from "@/store/index.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useTeamStore } from "@/store/team.store";
import { useVehicleStore } from "@/store/vehicle.store";
import { useDepotStore } from "@/store/depots.store";
import { signOut } from "next-auth/react";
import { MENU_ITEMS } from "./sidebar.constants";

const { Title } = Typography;

interface BottomMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action?: () => void;
  isDanger?: boolean;
}

const getInitials = (name: string) => {
  if (!name) return "AD";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AD";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser, setCurrentTab, setSidebarNavigation } =
    useIndexStore();
  const { onboarding } = useOnboardingStore();
  const { teams } = useTeamStore();
  const { vehicles } = useVehicleStore();
  const { depots } = useDepotStore();

  const businessName = onboarding?.company_name || "Admin";
  const initials = getInitials(businessName);

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

  const bottomMenuItems: BottomMenuItem[] = [
    {
      icon: (props) => (
        <Image
          src="/logout.svg"
          alt="Logout"
          width={20}
          height={20}
          {...props}
        />
      ),
      label: "Log out",
      action: handleLogout,
      isDanger: true,
    },
  ];

  const userPopoverContent = (
    <div className="w-[260px] p-3 font-sans">
      {/* Centered Avatar & Identity */}
      <div className="flex flex-col items-center pt-1">
        <Avatar
          size={52}
          style={{ backgroundColor: "#003220", color: "#ffffff" }}
          className="font-bold text-lg shadow-md border-2 border-white mb-2"
        >
          {initials}
        </Avatar>
        <h3
          className="text-sm font-bold text-gray-900 leading-tight mb-0.5 text-center truncate max-w-full px-2"
          title={businessName}
        >
          {businessName}
        </h3>
        {user?.email && (
          <p
            className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5 truncate max-w-full px-2"
            title={user.email}
          >
            <MailOutlined className="text-[10px] text-gray-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </p>
        )}
      </div>

      {/* Resource Metrics Section - Team, Vehicles, Depots */}
      <div className="my-2.5 p-2 rounded-none border border-emerald-100/80 space-y-1.5">
        <div className="flex items-center justify-between text-xs px-2 py-1 bg-white rounded-none border border-emerald-100/50 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <div className="w-5 h-5 rounded-none bg-emerald-100/80 flex items-center justify-center text-[#003220] text-xs shrink-0">
              <TeamOutlined />
            </div>
            <span>Team Members</span>
          </div>
          <span className="bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#003220] border border-emerald-200">
            {teams.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs px-2 py-1 bg-white rounded-none border border-emerald-100/50 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <div className="w-5 h-5 rounded-none bg-emerald-100/80 flex items-center justify-center text-[#003220] text-xs shrink-0">
              <CarOutlined />
            </div>
            <span>Vehicles</span>
          </div>
          <span className="bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#003220] border border-emerald-200">
            {vehicles.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs px-2 py-1 bg-white rounded-none border border-emerald-100/50 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <div className="w-5 h-5 rounded-none bg-emerald-100/80 flex items-center justify-center text-[#003220] text-xs shrink-0">
              <EnvironmentOutlined />
            </div>
            <span>Depots</span>
          </div>
          <span className="bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#003220] border border-emerald-200">
            {depots.length}
          </span>
        </div>
      </div>

      {/* Organization Info Box */}
      {/* <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 flex flex-col items-center text-center">
        <p className="text-[9px] font-extrabold text-[#003220]/70 uppercase tracking-widest mb-0.5">
          Organization
        </p>
        <h4
          className="text-xs font-bold text-gray-900 truncate w-full px-1 mb-1.5"
          title={businessName}
        >
          {businessName}
        </h4>
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-[#003220] border border-emerald-200 uppercase tracking-wider">
            Admin
          </span>
          <span className="text-gray-300 text-[10px]">•</span>
          <span className="text-[10px] text-gray-600 font-semibold">
            Standard Plan
          </span>
        </div>
      </div> */}

      {/* Bottom Action Controls */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            handleNavigation("/team", "team");
            router.push("/team");
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-none transition-colors cursor-pointer"
        >
          <SettingOutlined className="text-xs" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
        >
          <LogoutOutlined className="text-xs" />
          Logout
        </button>
      </div>
    </div>
  );

  const getMenuItemClasses = (path: string, hasActiveSub = false) => {
    const active = isActive(path);
    if (active) {
      return "w-full flex items-center py-2 px-3 rounded-none transition-all duration-200 cursor-pointer bg-primary text-white";
    }
    if (hasActiveSub) {
      return "w-full flex items-center py-2 px-3 rounded-none transition-all duration-200 cursor-pointer bg-gray-100 text-gray-700 font-medium";
    }
    return "w-full flex items-center py-2 px-3 rounded-none transition-all duration-200 cursor-pointer hover:bg-gray-50 text-gray-700";
  };

  return (
    <aside className="h-screen bg-white flex flex-col border-r overflow-hidden shrink-0 w-48">
      {/* Logo Section */}
      <div className="pt-3 px-3 mb-2 h-14 flex items-center">
        <Link
          href="/dashboard"
          onClick={() => handleNavigation("/dashboard", "dashboard")}
        >
          <div className="flex items-center cursor-pointer">
            <Image
              src="/syncnox.svg"
              alt="SYNCNOX"
              width={125}
              height={34}
              priority
            />
          </div>
        </Link>
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

          return (
            <div key={item.path} className="mb-1">
              {hasSubItems ? (
                // Menu item with sub-items (always visible)
                <>
                  <div className={getMenuItemClasses(item.path, activeSub)}>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <Icon
                        className={`text-base ${
                          active ? "text-primary" : "text-gray-700"
                        }`}
                      />
                    </div>
                    <span className="ml-2.5 text-sm font-medium whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  </div>

                  {/* Sub-items (always open) */}
                  <div className="mt-1 mb-1 space-y-0.5">
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
                            className={`flex items-center py-1.5 pl-8 pr-2.5 text-xs rounded-none cursor-pointer transition-colors ${
                              subActive
                                ? "bg-primary text-white font-medium"
                                : "hover:bg-gray-50 text-gray-600"
                            }`}
                          >
                            <SubIcon
                              className={`mr-2 text-xs shrink-0 ${
                                subActive ? "text-white" : "text-gray-500"
                              }`}
                            />
                            <span className="truncate">{subItem.label}</span>
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
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <Icon
                        className={`text-base ${
                          active ? "text-white" : "text-gray-700"
                        }`}
                      />
                    </div>
                    <span
                      className={`ml-2.5 text-sm whitespace-nowrap overflow-hidden ${
                        active ? "font-medium" : ""
                      }`}
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
      <footer className="border-t pt-2.5 pb-3 px-2">
        {/* User Profile */}
        <Popover
          content={userPopoverContent}
          trigger="click"
          placement="top"
          overlayClassName="user-profile-popover"
          arrow={false}
          styles={{ container: { padding: 2, borderRadius: 10, marginLeft: 30 } }}
        >
          <div className="flex items-center px-2 py-1.5 mb-1.5 cursor-pointer rounded hover:bg-gray-50 transition-colors group">
            <Avatar
              size={30}
              style={{ backgroundColor: "#003220", color: "#ffffff" }}
              className="font-bold text-xs shrink-0 shadow-sm transition-transform group-hover:scale-105"
            >
              {initials}
            </Avatar>
            <div className="ml-2 overflow-hidden truncate">
              <p
                className="text-xs font-semibold text-gray-800 truncate group-hover:text-primary transition-colors"
                title={businessName}
              >
                {businessName}
              </p>
            </div>
          </div>
        </Popover>

        {/* Bottom Menu Items */}
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center px-2.5 py-1.5 rounded-none transition-all duration-200 cursor-pointer ${
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
              <span className="ml-2.5 text-xs font-medium whitespace-nowrap overflow-hidden">
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
