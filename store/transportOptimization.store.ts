import { create } from "zustand";
import {
  optimizeTransportJobs,
  TransportOptimizePayload,
  TransportOptimizeResponse,
} from "@/apis/transport.api";

interface TransportOptimizationState {
  result: TransportOptimizeResponse | null;
  isOptimizing: boolean;
  error: string | null;

  /**
   * Trigger transport optimization.
   * The backend runs synchronously, so this resolves when results are ready.
   */
  optimize: (payload: TransportOptimizePayload) => Promise<TransportOptimizeResponse>;
  clearResult: () => void;
}

export const useTransportOptimizationStore = create<TransportOptimizationState>(
  (set) => ({
    result: null,
    isOptimizing: false,
    error: null,

    optimize: async (payload) => {
      set({ isOptimizing: true, error: null, result: null });
      try {
        const response = await optimizeTransportJobs(payload);
        set({ result: response, isOptimizing: false });
        return response;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Transport optimization failed";
        set({ error: errorMessage, isOptimizing: false });
        throw new Error(errorMessage);
      }
    },

    clearResult: () => {
      set({ result: null, error: null, isOptimizing: false });
    },
  })
);
