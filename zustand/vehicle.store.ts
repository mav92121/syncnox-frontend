import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Vehicle } from "@/types/vehicle.type";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle as deleteVehicleApi,
} from "@/apis/vehicle.api";

interface VehicleStore {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchVehicles: () => Promise<void>;
  initializeVehicles: () => Promise<void>;
  createVehicleAction: (vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  updateVehicleAction: (vehicle: Vehicle) => Promise<Vehicle>;
  deleteVehicleAction: (vehicleId: number) => Promise<void>;
  getVehiclesMap: () => Record<number, string>;
}

export const useVehicleStore = create(
  devtools(
    immer<VehicleStore>((set, get) => ({
      vehicles: [],
      isLoading: false,
      error: null,
      hasFetched: false,

      fetchVehicles: async () => {
        set({ isLoading: true });
        try {
          const vehicles = await fetchVehicles();
          set({ vehicles, hasFetched: true });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch vehicles",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeVehicles: async () => {
        const { hasFetched, isLoading } = get();
        if (hasFetched || isLoading) return;
        await get().fetchVehicles();
      },

      createVehicleAction: async (vehicle: Partial<Vehicle>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const newVehicle = await createVehicle(vehicle);
          set((state) => {
            state.vehicles = [newVehicle, ...state.vehicles];
            state.isLoading = false;
          });
          return newVehicle;
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to create vehicle";
          });
          throw error;
        }
      },

      updateVehicleAction: async (vehicle: Vehicle) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedVehicle = await updateVehicle(vehicle);
          set((state) => {
            const index = state.vehicles.findIndex(
              (v) => v.id === updatedVehicle.id
            );
            if (index !== -1) {
              state.vehicles[index] = updatedVehicle;
            }
            state.isLoading = false;
          });
          return updatedVehicle;
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to update vehicle";
          });
          throw error;
        }
      },

      deleteVehicleAction: async (vehicleId: number) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await deleteVehicleApi(vehicleId);
          set((state) => {
            state.vehicles = state.vehicles.filter((v) => v.id !== vehicleId);
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to delete vehicle";
          });
          throw error;
        }
      },

      getVehiclesMap: () => {
        const { vehicles } = get();
        return vehicles.reduce((acc, vehicle) => {
          acc[vehicle.id] = vehicle.name;
          return acc;
        }, {} as Record<number, string>);
      },
    }))
  )
);
