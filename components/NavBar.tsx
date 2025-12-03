"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTabsConfigForRoute, getActiveTab } from "@/config/navTabs.config";

const NavBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabsConfig = getTabsConfigForRoute(pathname);

  // Don't render navbar if no tabs configured for this route
  if (!tabsConfig) {
    return null;
  }

  const { queryParam, tabs } = tabsConfig;
  const currentQueryValue = searchParams.get(queryParam);
  const activeTab = getActiveTab(queryParam, currentQueryValue, tabs);

  return (
    <nav className="bg-white border-b border-gray-200 px-6">
      <div className="flex items-center gap-8 h-14">
        {/* Tabs */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab.key === tab.key;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.key}
                href={`${pathname}?${queryParam}=${tab.queryValue}`}
                className={`flex items-center gap-2 px-1 h-14 border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {Icon && <Icon className="text-base" />}
                <span className="text-sm">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
