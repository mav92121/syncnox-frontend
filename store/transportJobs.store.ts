import { create } from "zustand";
import {
  TransportJob,
  TransportJobCreate,
  TransportJobUpdate,
} from "@/types/transportJob.type";
import {
  getTransportJobs,
  getTransportJobDates,
  createTransportJob,
  updateTransportJob,
  deleteTransportJob,
} from "@/apis/transport.api";

interface TransportJobsState {
  transportJobs: TransportJob[];
  transportJobDates: string[];
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedDate: string;

  setSelectedDate: (date: string) => void;
  fetchTransportJobs: (date?: string) => Promise<void>;
  fetchTransportJobDates: () => Promise<void>;
  createTransportJobAction: (data: TransportJobCreate) => Promise<TransportJob>;
  updateTransportJobAction: (jobId: number, data: TransportJobUpdate) => Promise<TransportJob>;
  deleteTransportJobAction: (jobId: number) => Promise<void>;
  deleteTransportJobsAction: (jobIds: number[]) => Promise<void>;
}

const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const useTransportJobsStore = create<TransportJobsState>((set, get) => ({
  transportJobs: [],
  transportJobDates: [],
  total: 0,
  isLoading: false,
  error: null,
  selectedDate: getTodayDateString(),

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchTransportJobs(date);
  },

  fetchTransportJobs: async (date?: string) => {
    const activeDate = date || get().selectedDate;
    set({ isLoading: true, error: null });
    try {
      const response = await getTransportJobs(activeDate);
      set({
        transportJobs: response.items,
        total: response.total,
        isLoading: false,
      });
      // Also trigger dates fetch in background
      get().fetchTransportJobDates();
    } catch (err: any) {
      console.error("Failed to fetch transport jobs:", err);
      set({
        error: err.response?.data?.detail || "Failed to load transport jobs",
        isLoading: false,
      });
    }
  },

  fetchTransportJobDates: async () => {
    try {
      const dates = await getTransportJobDates();
      set({ transportJobDates: dates });
    } catch (err) {
      console.error("Failed to fetch transport job dates:", err);
    }
  },

  createTransportJobAction: async (data: TransportJobCreate) => {
    set({ isLoading: true, error: null });
    try {
      const newJob = await createTransportJob(data);
      set((state) => ({
        transportJobs: [newJob, ...state.transportJobs],
        total: state.total + 1,
        isLoading: false,
      }));
      return newJob;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateTransportJobAction: async (jobId: number, data: TransportJobUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const updatedJob = await updateTransportJob(jobId, data);
      set((state) => ({
        transportJobs: state.transportJobs.map((j) => (j.id === jobId ? updatedJob : j)),
        isLoading: false,
      }));
      return updatedJob;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  deleteTransportJobAction: async (jobId: number) => {
    try {
      await deleteTransportJob(jobId);
      set((state) => ({
        transportJobs: state.transportJobs.filter((j) => j.id !== jobId),
        total: Math.max(0, state.total - 1),
      }));
    } catch (err: any) {
      console.error("Failed to delete transport job:", err);
      throw err;
    }
  },

  deleteTransportJobsAction: async (jobIds: number[]) => {
    try {
      await Promise.all(jobIds.map((id) => deleteTransportJob(id)));
      set((state) => ({
        transportJobs: state.transportJobs.filter((j) => !jobIds.includes(j.id)),
        total: Math.max(0, state.total - jobIds.length),
      }));
    } catch (err: any) {
      console.error("Failed to delete transport jobs batch:", err);
      throw err;
    }
  },
}));
