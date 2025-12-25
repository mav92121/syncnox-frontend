import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useIndexStore, TabKey } from "@/zustand/index.store";

const ROUTE_TO_TAB_MAP: Record<string, TabKey> = {
  "/dashboard": "dashboard",
  "/plan": "unassigned-jobs",
  "/insights": "team",
  "/schedule": "schedule",
  "/analytics": "team",
  "/tracking": "routes",
  "/settings": "reports",
  "/team": "team",
  "/customers": "api",
};

export function useAutoSyncTab() {
  const pathname = usePathname();
  const { setCurrentTab, sidebarNavigation, setSidebarNavigation } =
    useIndexStore();
  const previousPathnameRef = useRef<string | null>(pathname);

  useEffect(() => {
    // Only sync tab when navigation came from the sidebar
    if (previousPathnameRef.current !== pathname && sidebarNavigation) {
      const defaultTab = ROUTE_TO_TAB_MAP[pathname];
      if (defaultTab) {
        setCurrentTab(defaultTab);
      }
      setSidebarNavigation(false); // Reset the flag after syncing
    }
    previousPathnameRef.current = pathname;
  }, [pathname, setCurrentTab, sidebarNavigation, setSidebarNavigation]);
}
