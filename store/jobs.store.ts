import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Job, JobStatus } from "@/types/job.type";
import {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob as deleteJobApi,
  deleteJobsBulk,
} from "@/apis/jobs.api";
import { findClosestDateToToday } from "@/utils/date.utils";

interface JobsState {
  // Data
  jobs: Job[];
  draftJobs: Job[];
  allDraftJobs: Job[];
  draftJobDates: string[];
  selectedDate: string | null;

  isLoading: boolean;
  error: string | null;

  // Actions
  initializeJobs: () => Promise<void>;
  fetchJobsByStatus: (status: JobStatus) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  createJobAction: (job: Job) => Promise<Job>;
  updateJobAction: (job: Job) => Promise<Job>;
  deleteJobAction: (jobId: number) => Promise<void>;
  deleteJobsAction: (jobIds: number[], status: JobStatus) => Promise<void>;
  refreshDraftJobs: () => Promise<void>;
  fetchJobsByDate: (date: string) => Promise<void>;
  patchJobLocally: (job: Job) => void;
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

      // Initialize with all draft jobs
      initializeJobs: async () => {
        const { isLoading } = get();

        // Skip if already loading
        if (isLoading) {
          return;
        }

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Fetch all draft jobs
          const draftJobsData = await fetchJobs({
            status: "draft",
            limit: 1000,
          });

          set((state) => {
            state.jobs = draftJobsData;
            state.allDraftJobs = draftJobsData;

            // Extract unique dates and sort
            state.draftJobDates = [
              ...new Set(draftJobsData.map((job) => job.scheduled_date)),
            ].sort();

            // Set initial selected date to closest to today
            if (state.draftJobDates.length > 0) {
              state.selectedDate = findClosestDateToToday(state.draftJobDates);

              // Filter draft jobs by selected date
              state.draftJobs = draftJobsData.filter(
                (job) => job.scheduled_date === state.selectedDate,
              );
            } else {
              state.selectedDate = null;
              state.draftJobs = [];
            }

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
      fetchJobsByStatus: async (status: JobStatus) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          if (status === "draft") {
            // Fetch all draft jobs and filter by selected date
            const draftJobsData = await fetchJobs({
              status: "draft",
              limit: 1000,
            });

            set((state) => {
              state.jobs = draftJobsData;
              state.allDraftJobs = draftJobsData;

              // Update dates
              state.draftJobDates = [
                ...new Set(draftJobsData.map((job) => job.scheduled_date)),
              ].sort();

              // Ensure selectedDate is valid
              if (state.draftJobDates.length > 0) {
                if (
                  !state.selectedDate ||
                  !state.draftJobDates.includes(state.selectedDate)
                ) {
                  state.selectedDate = findClosestDateToToday(
                    state.draftJobDates,
                  );
                }

                // Filter by selected date
                state.draftJobs = draftJobsData.filter(
                  (job) => job.scheduled_date === state.selectedDate,
                );
              } else {
                state.selectedDate = null;
                state.draftJobs = [];
              }

              state.isLoading = false;
            });
          } else {
            // Fetch other status jobs but preserve draft jobs
            const jobsData = await fetchJobs({ status });

            set((state) => {
              state.jobs = jobsData;
              // Don't touch allDraftJobs or draftJobs - keep them preserved
              state.isLoading = false;
            });
          }
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

      // Set selected date and filter draft jobs
      setSelectedDate: (date: string | null) => {
        set((state) => {
          state.selectedDate = date;

          // Filter draft jobs from allDraftJobs by new selected date
          if (date) {
            state.draftJobs = state.allDraftJobs.filter(
              (job) => job.scheduled_date === date,
            );
          } else {
            state.draftJobs = state.allDraftJobs;
          }
        });
      },

      // Create job and refresh
      createJobAction: async (job: Job) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const newJob = await createJob(job);

          // Refresh draft jobs if created job is draft
          if (newJob.status === "draft") {
            await get().fetchJobsByStatus("draft");
          } else {
            // Just add to current jobs list
            set((state) => {
              state.jobs = [newJob, ...state.jobs];
              state.isLoading = false;
            });
          }

          return newJob;
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error ? error.message : "Failed to create job";
          });
          throw error;
        }
      },

      // Update job and refresh
      updateJobAction: async (job: Job) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedJob = await updateJob(job);

          // Refresh draft jobs if it's a draft
          if (updatedJob.status === "draft") {
            await get().fetchJobsByStatus("draft");
          } else {
            // Update in current jobs list
            set((state) => {
              state.jobs = state.jobs.map((j) =>
                j.id === updatedJob.id ? updatedJob : j,
              );
              state.isLoading = false;
            });
          }

          return updatedJob;
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error ? error.message : "Failed to update job";
          });
          throw error;
        }
      },

      // Delete job and refresh
      deleteJobAction: async (jobId: number) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await deleteJobApi(jobId);

          // Find the deleted job's status
          const deletedJob = get().jobs.find((j) => j.id === jobId);

          if (deletedJob?.status === "draft") {
            await get().fetchJobsByStatus("draft");
          } else {
            // Remove from current jobs list
            set((state) => {
              state.jobs = state.jobs.filter((job) => job.id !== jobId);
              state.isLoading = false;
            });
          }
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error ? error.message : "Failed to delete job";
          });
          throw error;
        }
      },

      // Bulk delete jobs
      deleteJobsAction: async (jobIds: number[], status: JobStatus) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await deleteJobsBulk(jobIds);
          await get().fetchJobsByStatus(status);
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error =
              error instanceof Error ? error.message : "Failed to delete jobs";
          });
          throw error;
        }
      },

      // Refresh draft jobs (used after bulk upload)
      refreshDraftJobs: async () => {
        await get().fetchJobsByStatus("draft");
      },

      // Fetch all jobs for a specific date
      fetchJobsByDate: async (date: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const jobsData = await fetchJobs({
            date,
            limit: 1000,
          });

          set((state) => {
            state.jobs = jobsData;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to fetch jobs by date";
            state.isLoading = false;
          });
        }
      },

      patchJobLocally: (job: Job) => {
        set((state) => {
          state.jobs = state.jobs.map((j) => (j.id === job.id ? job : j));
          state.draftJobs = state.draftJobs.map((j) =>
            j.id === job.id ? job : j,
          );
          state.allDraftJobs = state.allDraftJobs.map((j) =>
            j.id === job.id ? job : j,
          );
        });
      },

      resetAllJobs: () => {
        set((state) => {
          state.jobs = state.allDraftJobs;
          state.draftJobs = state.selectedDate
            ? state.allDraftJobs.filter(
                (job) => job.scheduled_date === state.selectedDate,
              )
            : state.allDraftJobs;
        });
      },
    })),
    {
      name: "jobs-store",
    },
  ),
);
