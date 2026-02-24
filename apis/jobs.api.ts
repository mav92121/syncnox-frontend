import apiClient from "@/config/apiClient.config";
import { Job, FetchJobsParams } from "@/types/job.type";

export const fetchJobs = async (params?: FetchJobsParams): Promise<Job[]> => {
  const queryParams = new URLSearchParams();

  if (params?.skip !== undefined) {
    queryParams.append("skip", params.skip.toString());
  }
  if (params?.limit !== undefined) {
    queryParams.append("limit", params.limit.toString());
  }
  if (params?.status) {
    queryParams.append("status", params.status);
  }
  if (params?.date) {
    queryParams.append("date", params.date);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/jobs?${queryString}` : "/jobs";

  const response = await apiClient.get<Job[]>(url);
  return response.data;
};

export const createJob = async (job: Job): Promise<Job> => {
  const response = await apiClient.post<Job>("/jobs", job);
  return response.data;
};

export const updateJob = async (job: Job): Promise<Job> => {
  const response = await apiClient.put<Job>(`/jobs/${job.id}`, job);
  return response.data;
};

export const deleteJob = async (jobId: number): Promise<void> => {
  await apiClient.delete(`/jobs/${jobId}`);
};

export const deleteJobsBulk = async (jobIds: number[]): Promise<void> => {
  await apiClient.post("/jobs/bulk/delete", jobIds);
};

export const markJobCompleted = async (jobId: number): Promise<Job> => {
  const response = await apiClient.put<Job>(`/jobs/${jobId}`, {
    status: "completed",
  });
  return response.data;
};
