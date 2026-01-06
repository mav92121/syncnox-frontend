import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AllRoutes, Route } from "@/types/routes.type";
import { fetchRoutes, deleteOptimizationRequest } from "@/apis/routes.api";

interface RouteStore {
  routes: AllRoutes[];
  currentRoute: Route | null;
  isLoading: boolean;
  error: string | null;
  fetchRoutes: (status?: string) => Promise<void>;
  initializeRoutes: () => Promise<void>;
  hasFetched: boolean;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  setCurrentRoute: (route: Route | null) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (id: number) => Promise<void>;
}

export const useRouteStore = create(
  devtools(
    immer<RouteStore>((set, get) => ({
      routes: [],
      currentRoute: null,
      isLoading: false,
      error: null,
      hasFetched: false,
      selectedStatus: "scheduled",

      fetchRoutes: async (status?: string) => {
        set({ isLoading: true });
        try {
          const routes = await fetchRoutes(status);
          set({ routes });
          set({ hasFetched: true });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },
      initializeRoutes: async () => {
        const { hasFetched, isLoading, selectedStatus } = get();
        if (hasFetched || isLoading) return;
        await get().fetchRoutes(selectedStatus);
      },
      setSelectedStatus: (status: string) => {
        set({ selectedStatus: status });
        get().fetchRoutes(status);
      },
      setCurrentRoute: (route: Route | null) => set({ currentRoute: route }),
      updateRoute: (updatedRoute: Route) => {
        set((state) => {
          const index = state.routes.findIndex((r) => r.id === updatedRoute.id);
          if (index !== -1) {
            state.routes[index] = {
              ...state.routes[index],
              ["name"]: updatedRoute.route_name,
            };
          }
          if (state.currentRoute?.id === updatedRoute.id) {
            state.currentRoute = { ...state.currentRoute, ...updatedRoute };
          }
        });
      },
      deleteRoute: async (id: number) => {
        try {
          await deleteOptimizationRequest(id);
          set((state) => {
            state.routes = state.routes.filter((r) => r.id !== id);
            if (state.currentRoute?.id === id) {
              state.currentRoute = null;
            }
          });
        } catch (error) {
          console.error("Failed to delete route:", error);
          throw error;
        }
      },
    }))
  )
);
