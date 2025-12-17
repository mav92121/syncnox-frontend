import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Job, FetchJobsParams, JobStatus } from "@/types/job.type";
import dayjs from "dayjs";
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
  draftJobs: Job[]; // Filtered draft jobs for display
  allDraftJobs: Job[]; // All draft jobs fetched from API
  draftJobDates: string[]; // Set of dates with draft jobs
  selectedDate: string | null; // Currently selected date filter

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
  fetchDraftJobs: (params?: FetchJobsParams) => Promise<void>; // Fetch only draft jobs
  createJobAction: (job: Job) => Promise<Job>; // Create job with API call + state update
  updateJobAction: (job: Job) => Promise<Job>; // Update job with API call + state update
  deleteJobAction: (jobId: number) => Promise<void>; // Delete job with API call + state update
  setStatusFilter: (status: JobStatus | null) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  refreshJobs: () => Promise<void>;
  clearJobs: () => void;
  setSelectedDate: (date: string | null) => void;
  filterDraftJobs: () => void;

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
      allDraftJobs: [],
      draftJobDates: [],
      selectedDate: null,
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
          // Make parallel API calls for all jobs and all draft jobs
          const [allJobsData, draftJobsData] = await Promise.all([
            fetchJobs(params),
            fetchJobs({
              status: "draft",
              limit: 1000, // Fetch all/many drafts for proper date filtering
            }),
          ]);

          set((state) => {
            state.jobs = allJobsData;
            state.filteredJobs = allJobsData;
            state.allDraftJobs = draftJobsData;
            state.draftJobDates = [
              ...new Set(draftJobsData.map((job) => job.scheduled_date)),
            ].sort();

            // Set initial selected date to latest available if exists, else today
            if (!state.selectedDate && state.draftJobDates.length > 0) {
              state.selectedDate =
                state.draftJobDates[state.draftJobDates.length - 1];
            } else if (!state.selectedDate) {
              state.selectedDate = dayjs().format("YYYY-MM-DD");
            }

            state.totalJobs = allJobsData.length;
            state.isLoading = false;
            state.hasFetched = true;
          });

          // Trigger local filter
          get().filterDraftJobs();
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to fetch jobs";
            state.isLoading = false;
          });
        }
      },

      // Fetch draft jobs only (refresh all drafts)
      fetchDraftJobs: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Fetch all/many drafts
          const draftJobsData = await fetchJobs({
            status: "draft",
            limit: 1000,
          });

          set((state) => {
            state.allDraftJobs = draftJobsData;
            state.draftJobDates = [
              ...new Set(draftJobsData.map((job) => job.scheduled_date)),
            ].sort();
            state.isLoading = false;
          });

          // Re-apply filter
          get().filterDraftJobs();
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to fetch draft jobs";
            state.isLoading = false;
          });
        }
      },

      setSelectedDate: (date: string | null) => {
        set((state) => {
          state.selectedDate = date;
        });
        get().filterDraftJobs();
      },

      filterDraftJobs: () => {
        set((state) => {
          if (state.selectedDate) {
            state.draftJobs = state.allDraftJobs.filter(
              (job) => job.scheduled_date === state.selectedDate
            );
          } else {
            state.draftJobs = state.allDraftJobs;
          }
        });
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
            state.filteredJobs = [newJob, ...state.filteredJobs];
            // state.draftJobs will be handled by filterDraftJobs

            // Add to allDraftJobs if it is a draft
            if (newJob.status === "draft") {
              state.allDraftJobs = [newJob, ...state.allDraftJobs];
              state.draftJobDates = [
                ...new Set(state.allDraftJobs.map((job) => job.scheduled_date)),
              ].sort();
            }

            state.isLoading = false;
          });

          // Trigger local filter
          get().filterDraftJobs();

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
            state.filteredJobs = state.filteredJobs.map((j) =>
              j.id === updatedJob.id ? updatedJob : j
            );

            // Update allDraftJobs logic
            if (updatedJob.status === "draft") {
              // Check if it was already in drafts
              const index = state.allDraftJobs.findIndex(
                (j) => j.id === updatedJob.id
              );
              if (index !== -1) {
                state.allDraftJobs[index] = updatedJob;
              } else {
                state.allDraftJobs = [updatedJob, ...state.allDraftJobs];
              }
            } else {
              // Remove from drafts if status changed from draft to something else
              state.allDraftJobs = state.allDraftJobs.filter(
                (j) => j.id !== updatedJob.id
              );
            }

            // Recalculate dates
            state.draftJobDates = [
              ...new Set(state.allDraftJobs.map((job) => job.scheduled_date)),
            ].sort();

            state.isLoading = false;
          });

          // Trigger local filter
          get().filterDraftJobs();

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

            // Remove from allDraftJobs
            state.allDraftJobs = state.allDraftJobs.filter(
              (job) => job.id !== jobId
            );

            // Recalculate dates
            state.draftJobDates = [
              ...new Set(state.allDraftJobs.map((job) => job.scheduled_date)),
            ].sort();

            state.isLoading = false;
          });

          // Trigger local filter
          get().filterDraftJobs();
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
