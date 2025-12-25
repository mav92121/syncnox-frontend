import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  tenant_id: string;
}

export type TabKey =
  | "dashboard"
  | "jobs"
  | "routes"
  | "schedule" // /dashboard tabs
  | "add-jobs"
  | "unassigned-jobs" // /plan tabs
  | "team"
  | "vehicle" // /insights & /analytics tabs
  | "optimization"
  | "reports"
  | "api"; // /schedule tabs

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  currentTab: TabKey;
  sidebarNavigation: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setCurrentTab: (tab: TabKey) => void;
  resetTab: (defaultTab: TabKey) => void;
  setSidebarNavigation: (value: boolean) => void;
}

export const useIndexStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentTab: "dashboard",
      sidebarNavigation: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      resetTab: (defaultTab) => set({ currentTab: defaultTab }),
      setSidebarNavigation: (value) => set({ sidebarNavigation: value }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentTab: state.currentTab,
      }),
    }
  )
);
