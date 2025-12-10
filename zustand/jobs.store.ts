import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Job, FetchJobsParams, JobStatus } from "@/types/job.type";
import {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob as deleteJobApi,
} from "@/apis/jobs.api";

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
  createJobAction: (job: Job) => Promise<Job>; // Create job with API call + state update
  updateJobAction: (job: Job) => Promise<Job>; // Update job with API call + state update
  deleteJobAction: (jobId: number) => Promise<void>; // Delete job with API call + state update
  setStatusFilter: (status: JobStatus | null) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  refreshJobs: () => Promise<void>;
  clearJobs: () => void;

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

      // Create job: API call + state update
      createJobAction: async (job: Job) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const newJob = await createJob(job);

          // Update state with the new job
          set((state) => {
            state.jobs = [newJob, ...state.jobs];
            state.draftJobs = [newJob, ...state.draftJobs];
            state.filteredJobs = [newJob, ...state.filteredJobs];
            state.isLoading = false;
          });

          return newJob;
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error ? error.message : "Failed to create job";
          });
          throw error; // Re-throw so component can handle the error
        }
      },

      // Update job: API call + state update
      updateJobAction: async (job: Job) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedJob = await updateJob(job);

          // Update state with the updated job
          set((state) => {
            state.jobs = state.jobs.map((j) =>
              j.id === updatedJob.id ? updatedJob : j
            );
            state.draftJobs = state.draftJobs.map((j) =>
              j.id === updatedJob.id ? updatedJob : j
            );
            state.filteredJobs = state.filteredJobs.map((j) =>
              j.id === updatedJob.id ? updatedJob : j
            );
            state.isLoading = false;
          });

          return updatedJob;
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error ? error.message : "Failed to update job";
          });
          throw error; // Re-throw so component can handle the error
        }
      },

      // Delete job: API call + state update
      deleteJobAction: async (jobId: number) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await deleteJobApi(jobId);

          // Update state by removing the deleted job
          set((state) => {
            state.jobs = state.jobs.filter((job) => job.id !== jobId);
            state.filteredJobs = state.filteredJobs.filter(
              (job) => job.id !== jobId
            );
            state.draftJobs = state.draftJobs.filter((job) => job.id !== jobId);
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error ? error.message : "Failed to delete job";
          });
          throw error; // Re-throw so component can handle the error
        }
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
