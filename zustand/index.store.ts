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
  setUser: (user: User) => void;
  clearUser: () => void;
  setCurrentTab: (tab: TabKey) => void;
  resetTab: (defaultTab: TabKey) => void;
}

export const useIndexStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentTab: "dashboard",
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      resetTab: (defaultTab) => set({ currentTab: defaultTab }),
    }),
    {
      name: "user-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
