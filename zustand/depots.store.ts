import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Depot } from "@/types/depots.type";
import { fetchDepots } from "@/apis/depots.api";

interface DepotStore {
  depots: Depot[];
  isLoading: boolean;
  error: string | null;
  fetchDepots: () => Promise<void>;
  initializeDepots: () => Promise<void>;
  hasFetched: boolean;
}

export const useDepotStore = create(
  devtools(
    immer<DepotStore>((set, get) => ({
      depots: [],
      isLoading: false,
      error: null,
      hasFetched: false,

      fetchDepots: async () => {
        set({ isLoading: true });
        try {
          const depots = await fetchDepots();
          set({ depots });
          set({ hasFetched: true });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },
      initializeDepots: async () => {
        const { hasFetched, isLoading } = get();
        if (hasFetched || isLoading) return;
        await get().fetchDepots();
      },
    }))
  )
);
