import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  LocationMapping,
  LocationMappingCreate,
  fetchLocationMappings,
  createLocationMapping,
  batchCreateLocationMappings,
  deleteLocationMapping,
} from "@/apis/location-mapping.api";

interface LocationMappingStore {
  locationMappings: LocationMapping[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasFetched: boolean;

  fetchLocationMappings: () => Promise<void>;
  initializeLocationMappings: () => Promise<void>;
  createLocationMapping: (payload: LocationMappingCreate) => Promise<boolean>;
  batchCreateLocationMappingsAction: (payloads: LocationMappingCreate[]) => Promise<number>;
  deleteLocationMapping: (id: number) => Promise<boolean>;
  bulkDeleteLocationMappings: (ids: number[]) => Promise<boolean>;
}

export const useLocationMappingStore = create(
  devtools(
    immer<LocationMappingStore>((set, get) => ({
      locationMappings: [],
      isLoading: false,
      isSaving: false,
      error: null,
      hasFetched: false,

      fetchLocationMappings: async () => {
        set({ isLoading: true, error: null });
        try {
          const items = await fetchLocationMappings();
          set({ locationMappings: items, hasFetched: true });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeLocationMappings: async () => {
        const { hasFetched, isLoading } = get();
        if (hasFetched || isLoading) return;
        await get().fetchLocationMappings();
      },

      createLocationMapping: async (payload: LocationMappingCreate) => {
        set({ isSaving: true, error: null });
        try {
          const newItem = await createLocationMapping(payload);
          set((state) => {
            state.locationMappings.push(newItem);
          });
          return true;
        } catch (error) {
          set({ error: (error as Error).message });
          return false;
        } finally {
          set({ isSaving: false });
        }
      },

      batchCreateLocationMappingsAction: async (payloads: LocationMappingCreate[]) => {
        set({ isSaving: true, error: null });
        try {
          const count = await batchCreateLocationMappings(payloads);
          await get().fetchLocationMappings();
          return count;
        } catch (error) {
          set({ error: (error as Error).message });
          return 0;
        } finally {
          set({ isSaving: false });
        }
      },


      deleteLocationMapping: async (id: number) => {
        set({ isSaving: true, error: null });
        try {
          await deleteLocationMapping(id);
          set((state) => {
            state.locationMappings = state.locationMappings.filter((m) => m.id !== id);
          });
          return true;
        } catch (error) {
          set({ error: (error as Error).message });
          return false;
        } finally {
          set({ isSaving: false });
        }
      },

      bulkDeleteLocationMappings: async (ids: number[]) => {
        set({ isSaving: true, error: null });
        try {
          for (const id of ids) {
            await deleteLocationMapping(id);
          }
          set((state) => {
            state.locationMappings = state.locationMappings.filter((m) => !ids.includes(m.id));
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
