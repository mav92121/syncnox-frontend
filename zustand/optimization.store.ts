import { create } from "zustand";
import {
  createOptimizationRequest,
  getOptimizationRequest,
  CreateOptimizationRequestPayload,
} from "@/apis/routes.api";
import { Route } from "@/types/routes.type";

interface OptimizationStore {
  currentOptimization: Route | null;
  isPolling: boolean;
  error: string | null;
  pollingIntervalId: NodeJS.Timeout | null;

  // Actions
  startOptimization: (
    payload: CreateOptimizationRequestPayload
  ) => Promise<Route>;
  pollOptimizationStatus: (id: number) => void;
  stopPolling: () => void;
  clearOptimization: () => void;
  fetchOptimization: (id: number) => Promise<Route>;
}

const POLL_INTERVAL_MS = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 60; // 2 minutes total

export const useOptimizationStore = create<OptimizationStore>((set, get) => ({
  currentOptimization: null,
  isPolling: false,
  error: null,
  pollingIntervalId: null,

  startOptimization: async (payload: CreateOptimizationRequestPayload) => {
    try {
      set({ error: null });
      const optimization = await createOptimizationRequest(payload);
      set({ currentOptimization: optimization });

      // Start polling for status updates
      get().pollOptimizationStatus(optimization.id);

      return optimization;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to create optimization request";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  pollOptimizationStatus: (id: number) => {
    let attempts = 0;

    set({ isPolling: true, error: null });

    const intervalId = setInterval(async () => {
      attempts++;

      try {
        const optimization = await getOptimizationRequest(id);
        set({ currentOptimization: optimization });

        // Check if optimization is complete
        if (
          optimization.status === "completed" ||
          optimization.status === "success"
        ) {
          get().stopPolling();
          return;
        }

        // Check if optimization failed
        if (optimization.status === "failed") {
          get().stopPolling();
          set({
            error: optimization.error_message || "Optimization failed",
          });
          return;
        }

        // Check if max attempts reached
        if (attempts >= MAX_POLL_ATTEMPTS) {
          get().stopPolling();
          set({
            error:
              "Optimization is taking longer than expected. Please check back later.",
          });
          return;
        }
      } catch (error: any) {
        console.error("Polling error:", error);
        get().stopPolling();
        set({
          error:
            error.response?.data?.detail ||
            error.message ||
            "Failed to fetch optimization status",
        });
      }
    }, POLL_INTERVAL_MS);

    set({ pollingIntervalId: intervalId });
  },

  stopPolling: () => {
    const { pollingIntervalId } = get();
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      set({ pollingIntervalId: null, isPolling: false });
    }
  },

  clearOptimization: () => {
    get().stopPolling();
    set({
      currentOptimization: null,
      error: null,
      isPolling: false,
      pollingIntervalId: null,
    });
  },

  fetchOptimization: async (id: number) => {
    try {
      set({ error: null });
      const optimization = await getOptimizationRequest(id);
      set({ currentOptimization: optimization });
      return optimization;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch optimization";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },
}));
