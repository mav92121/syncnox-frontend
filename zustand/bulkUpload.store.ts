import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { BulkUploadResponse, GeocodedRow } from "@/types/bulk-upload.type";

interface BulkUploadStore {
  // Current step (1: Upload, 2: Mapping, 3: Preview)
  currentStep: number;

  // File upload
  uploadedFile: File | null;
  uploadResponse: BulkUploadResponse | null;

  // Default scheduled date for bulk upload
  defaultScheduledDate: string | null;

  // Column mapping
  columnMapping: Record<string, string>; // {identifier: excel_column_name}
  saveAsDefault: boolean;

  // Geocoded data
  geocodedData: GeocodedRow[];
  isGeocoding: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setUploadedFile: (file: File | null) => void;
  setUploadResponse: (response: BulkUploadResponse | null) => void;
  setDefaultScheduledDate: (date: string | null) => void;
  setColumnMapping: (mapping: Record<string, string>) => void;
  setSaveAsDefault: (save: boolean) => void;
  setGeocodedData: (data: GeocodedRow[]) => void;
  updateGeocodedRow: (index: number, row: Partial<GeocodedRow>) => void;
  setIsGeocoding: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  uploadedFile: null,
  uploadResponse: null,
  defaultScheduledDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD
  columnMapping: {},
  saveAsDefault: true, // Default to checked
  geocodedData: [],
  isGeocoding: false,
};

export const useBulkUploadStore = create<BulkUploadStore>()(
  immer((set) => ({
    ...initialState,

    setCurrentStep: (step: number) => {
      set((state) => {
        state.currentStep = step;
      });
    },

    setUploadedFile: (file: File | null) => {
      set((state) => {
        state.uploadedFile = file;
      });
    },

    setUploadResponse: (response: BulkUploadResponse | null) => {
      set((state) => {
        state.uploadResponse = response;
      });
    },

    setDefaultScheduledDate: (date: string | null) => {
      set((state) => {
        state.defaultScheduledDate = date;
      });
    },

    setColumnMapping: (mapping: Record<string, string>) => {
      set((state) => {
        state.columnMapping = mapping;
      });
    },

    setSaveAsDefault: (save: boolean) => {
      set((state) => {
        state.saveAsDefault = save;
      });
    },

    setGeocodedData: (data: GeocodedRow[]) => {
      set((state) => {
        state.geocodedData = data;
      });
    },

    updateGeocodedRow: (index: number, row: Partial<GeocodedRow>) => {
      set((state) => {
        if (state.geocodedData[index]) {
          state.geocodedData[index] = {
            ...state.geocodedData[index],
            ...row,
          };
        }
      });
    },

    setIsGeocoding: (loading: boolean) => {
      set((state) => {
        state.isGeocoding = loading;
      });
    },

    reset: () => {
      set(() => initialState);
    },
  }))
);
