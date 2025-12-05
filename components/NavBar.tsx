"use client";
import { usePathname } from "next/navigation";
import { getTabsConfigForRoute } from "@/config/navTabs.config";
import { useTabStore } from "@/zustand/tab.store";

const NavBar = () => {
  const pathname = usePathname();
  const tabs = getTabsConfigForRoute(pathname);
  const { currentTab, setCurrentTab } = useTabStore();

  // Don't render navbar if no tabs configured for this route
  if (!tabs) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6">
      <div className="flex items-center gap-8 h-14">
        {/* Tabs */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as any)}
                className={`flex cursor-pointer items-center gap-2 px-1 h-14 border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {Icon && <Icon className="text-base" />}
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
