import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DashboardData } from "@/types/dashboard.type";
import { fetchDashboard } from "@/apis/dashboard.api";

interface DashboardState {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
}

const defaultDashboard: DashboardData = {
  kpi: {
    total_jobs: 0,
    active_routes: 0,
    completed_jobs: 0,
    scheduled_jobs: 0,
    total_drivers: 0,
    total_depots: 0,
  },
  optimization_impact: {
    total_distance_saved_km: 0,
    total_time_saved_hours: 0,
    vehicles_saved: 0,
  },
  recent_routes: [],
  top_drivers: [],
  upcoming: [],
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    immer((set, get) => ({
      dashboardData: null,
      isLoading: false,
      error: null,

      fetchDashboard: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const data = await fetchDashboard();

          set((state) => {
            state.dashboardData = data;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to fetch dashboard data";
            state.isLoading = false;
          });
        }
      },
    })),
    { name: "dashboard-store" },
  ),
);

export { defaultDashboard };
