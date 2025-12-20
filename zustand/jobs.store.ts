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
  draftJobs: Job[]; // Filtered draft jobs for display
  allDraftJobs: Job[]; // All draft jobs fetched from API
  draftJobDates: string[]; // Set of dates with draft jobs
  selectedDate: string | null; // Currently selected date filter

  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean; // Track if data has been fetched

  // Actions
  initializeJobs: () => Promise<void>; // Initialize with draft jobs only
  fetchJobs: (params?: FetchJobsParams) => Promise<void>; // Fetch jobs with optional params
  fetchJobsByStatus: (status: JobStatus) => Promise<void>; // Fetch jobs by status
  createJobAction: (job: Job) => Promise<Job>; // Create job with API call + state update
  updateJobAction: (job: Job) => Promise<Job>; // Update job with API call + state update
  deleteJobAction: (jobId: number) => Promise<void>; // Delete job with API call + state update
  clearJobs: () => void;
  setSelectedDate: (date: string | null) => void;
  filterDraftJobs: () => void;

  // Selectors
  getJobById: (id: number) => Job | undefined;
  getJobsByStatus: (status: JobStatus) => Job[];
  getDraftJobs: () => Job[];
  resetAllJobs: () => void;
}

export const useJobsStore = create<JobsState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      jobs: [],
      draftJobs: [],
      allDraftJobs: [],
      draftJobDates: [],
      selectedDate: null,
      isLoading: false,
      error: null,
      hasFetched: false,

      // Initialize jobs with draft jobs only
      initializeJobs: async () => {
        const { hasFetched, isLoading } = get();

        // Skip if already fetched or currently loading
        if (hasFetched || isLoading) {
          return;
        }

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Fetch only draft jobs on initialization
          const draftJobsData = await fetchJobs({
            status: "draft",
            limit: 1000, // Fetch all/many drafts
          });

          set((state) => {
            // Store draft jobs in both jobs and allDraftJobs
            state.jobs = draftJobsData;
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

      // Fetch jobs with optional params (for custom fetching)
      fetchJobs: async (params?: FetchJobsParams) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const jobsData = await fetchJobs(params);

          set((state) => {
            state.jobs = jobsData;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to fetch jobs";
            state.isLoading = false;
          });
        }
      },

      // Fetch jobs by status and update jobs state
      fetchJobsByStatus: async (status: JobStatus | "all") => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const jobsData = await fetchJobs(
            status === "all" ? {} : { status: status as JobStatus }
          );

          set((state) => {
            state.jobs = jobsData;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : `Failed to fetch ${status} jobs`;
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

      resetAllJobs: () => {
        set((state) => {
          state.jobs = state.allDraftJobs;
        });
      },

      // Clear all jobs
      clearJobs: () =>
        set((state) => {
          state.jobs = [];
          state.draftJobs = [];
          state.allDraftJobs = [];
          state.draftJobDates = [];
          state.selectedDate = null;
          state.error = null;
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
