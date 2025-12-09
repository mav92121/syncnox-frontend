import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Job, FetchJobsParams, JobStatus } from "@/types/job.type";
import { fetchJobs } from "@/apis/jobs.api";

interface JobsState {
  // Data
  jobs: Job[];
  filteredJobs: Job[];
  draftJobs: Job[]; // Draft jobs fetched separately

  // Pagination
  totalJobs: number;
  currentPage: number;
  itemsPerPage: number;

  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean; // Track if data has been fetched

  // Filters
  statusFilter: JobStatus | null;

  // Actions
  initializeJobs: (params?: FetchJobsParams) => Promise<void>; // Smart fetch (only if not already fetched)
  fetchJobs: (params?: FetchJobsParams) => Promise<void>; // Force fetch
  upsertJob: (job: Job, id?: number | null) => void;
  setStatusFilter: (status: JobStatus | null) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  refreshJobs: () => Promise<void>;
  clearJobs: () => void;
  deleteJob: (jobId: number) => void;

  // Selectors
  getJobById: (id: number) => Job | undefined;
  getJobsByStatus: (status: JobStatus) => Job[];
  getDraftJobs: () => Job[];
}

export const useJobsStore = create<JobsState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      jobs: [],
      filteredJobs: [],
      draftJobs: [],
      totalJobs: 0,
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      error: null,
      hasFetched: false,
      statusFilter: null,

      // Initialize jobs (fetch only if not already fetched)
      initializeJobs: async (params?: FetchJobsParams) => {
        const { hasFetched, isLoading } = get();

        // Skip if already fetched or currently loading
        if (hasFetched || isLoading) {
          return;
        }

        await get().fetchJobs(params);
      },

      // Fetch jobs with optional params (force fetch)
      fetchJobs: async (params?: FetchJobsParams) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Make parallel API calls for all jobs and draft jobs
          const [allJobsData, draftJobsData] = await Promise.all([
            fetchJobs(params),
            fetchJobs({ ...params, status: "draft" }),
          ]);

          set((state) => {
            state.jobs = allJobsData;
            state.filteredJobs = allJobsData;
            state.draftJobs = draftJobsData;
            state.totalJobs = allJobsData.length;
            state.isLoading = false;
            state.hasFetched = true; // Mark as fetched
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to fetch jobs";
            state.isLoading = false;
          });
        }
      },

      upsertJob: (job: Job, id: number | null = null) => {
        set((state) => {
          if (!id) {
            state.jobs = [job, ...state.jobs];
            state.draftJobs = [job, ...state.draftJobs];
            state.filteredJobs = [job, ...state.filteredJobs];
          } else {
            state.jobs = state.jobs.map((j) => (j.id === id ? job : j));
            state.draftJobs = state.draftJobs.map((j) =>
              j.id === id ? job : j
            );
            state.filteredJobs = state.filteredJobs.map((j) =>
              j.id === id ? job : j
            );
          }
        });
      },

      deleteJob: (jobId: number) => {
        set((state) => {
          state.jobs = state.jobs.filter((job) => job.id !== jobId);
          state.filteredJobs = state.filteredJobs.filter(
            (job) => job.id !== jobId
          );
          state.draftJobs = state.draftJobs.filter((job) => job.id !== jobId);
        });
      },

      // Set status filter and update filtered jobs
      setStatusFilter: (status) => {
        set((state) => {
          state.statusFilter = status;
          state.filteredJobs = status
            ? state.jobs.filter((job) => job.status === status)
            : state.jobs;
          state.currentPage = 1;
        });
      },

      // Pagination
      setPage: (page) =>
        set((state) => {
          state.currentPage = page;
        }),

      setItemsPerPage: (itemsPerPage) =>
        set((state) => {
          state.itemsPerPage = itemsPerPage;
          state.currentPage = 1;
        }),

      // Refresh jobs (re-fetch with current filters)
      refreshJobs: async () => {
        const { statusFilter, currentPage, itemsPerPage } = get();
        const skip = (currentPage - 1) * itemsPerPage;

        await get().fetchJobs({
          skip,
          limit: itemsPerPage,
          status: statusFilter || undefined,
        });
      },

      // Clear all jobs
      clearJobs: () =>
        set((state) => {
          state.jobs = [];
          state.filteredJobs = [];
          state.draftJobs = [];
          state.totalJobs = 0;
          state.currentPage = 1;
          state.error = null;
          state.statusFilter = null;
          state.hasFetched = false; // Reset fetch flag
        }),

      // Selectors
      getJobById: (id) => {
        const { jobs } = get();
        return jobs.find((job) => job.id === id);
      },

      getJobsByStatus: (status) => {
        const { jobs } = get();
        return jobs.filter((job) => job.status === status);
      },

      getDraftJobs: () => {
        const { jobs } = get();
        return jobs.filter((job) => job.status === "draft");
      },
    })),
    {
      name: "jobs-store",
    }
  )
);
