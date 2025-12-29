import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Depot } from "@/types/depots.type";
import {
  fetchDepots,
  updateDepot,
  UpdateDepotPayload,
} from "@/apis/depots.api";

interface DepotStore {
  depots: Depot[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasFetched: boolean;

  // Actions
  fetchDepots: () => Promise<void>;
  initializeDepots: () => Promise<void>;
  updateDepot: (id: number, payload: UpdateDepotPayload) => Promise<boolean>;
}

export const useDepotStore = create(
  devtools(
    immer<DepotStore>((set, get) => ({
      depots: [],
      isLoading: false,
      isSaving: false,
      error: null,
      hasFetched: false,

      fetchDepots: async () => {
        set({ isLoading: true, error: null });
        try {
          const depots = await fetchDepots();
          set({ depots, hasFetched: true });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeDepots: async () => {
        const { hasFetched, isLoading } = get();
        if (hasFetched || isLoading) return;
        await get().fetchDepots();
      },

      updateDepot: async (id: number, payload: UpdateDepotPayload) => {
        set({ isSaving: true, error: null });
        try {
          const updatedDepot = await updateDepot(id, payload);
          set((state) => {
            const index = state.depots.findIndex((d) => d.id === id);
            if (index !== -1) {
              state.depots[index] = updatedDepot;
            }
          });
          return true;
        } catch (error) {
          set({ error: (error as Error).message });
          return false;
        } finally {
          set({ isSaving: false });
        }
      },
    }))
  )
);
