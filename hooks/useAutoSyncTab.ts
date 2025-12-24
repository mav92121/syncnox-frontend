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
  const { setCurrentTab } = useIndexStore();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      const defaultTab = ROUTE_TO_TAB_MAP[pathname];
      if (defaultTab) {
        setCurrentTab(defaultTab);
      }
      previousPathnameRef.current = pathname;
    }
  }, [pathname, setCurrentTab]);
}
