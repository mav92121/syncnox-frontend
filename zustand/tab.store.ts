import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Union type of all possible tab keys across all routes
export type TabKey =
  | "dashboard"
  | "jobs"
  | "routes"
  | "schedule" // /dashboard tabs
  | "plan"
  | "recents" // /plan tabs
  | "team"
  | "vehicle" // /insights & /analytics tabs
  | "optimization"
  | "reports"
  | "api"; // /schedule tabs

interface TabState {
  currentTab: TabKey;
  setCurrentTab: (tab: TabKey) => void;
  resetTab: (defaultTab: TabKey) => void;
}

export const useTabStore = create<TabState>()(
  devtools(
    immer((set) => ({
      currentTab: "dashboard",

      setCurrentTab: (tab) =>
        set((state) => {
          state.currentTab = tab;
        }),

      resetTab: (defaultTab) =>
        set((state) => {
          state.currentTab = defaultTab;
        }),
    })),
    {
      name: "tab-store",
    }
  )
);
