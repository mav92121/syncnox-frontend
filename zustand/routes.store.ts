import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Route } from "@/types/routes.type";
import { fetchRoutes } from "@/apis/routes.api";

interface RouteStore {
  routes: Route[];
  currentRoute: Route | null;
  isLoading: boolean;
  error: string | null;
  fetchRoutes: () => Promise<void>;
  initializeRoutes: () => Promise<void>;
  hasFetched: boolean;
}

export const useRouteStore = create(
  devtools(
    immer<RouteStore>((set, get) => ({
      routes: [],
      currentRoute: null,
      isLoading: false,
      error: null,
      hasFetched: false,

      fetchRoutes: async () => {
        set({ isLoading: true });
        try {
          const routes = await fetchRoutes();
          set({ routes });
          set({ hasFetched: true });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },
      initializeRoutes: async () => {
        const { hasFetched, isLoading } = get();
        if (hasFetched || isLoading) return;
        await get().fetchRoutes();
      },
      setCurrentRoute: (route: Route | null) => set({ currentRoute: route }),
    }))
  )
);
