import apiClient from "@/config/apiClient.config";
import {
  TransportJob,
  TransportJobCreate,
  TransportJobUpdate,
  TransportJobListResponse,
} from "@/types/transportJob.type";

export const getTransportJobs = async (
  scheduledDate: string,
  skip: number = 0,
  limit: number = 1000
): Promise<TransportJobListResponse> => {
  const response = await apiClient.get<TransportJobListResponse>("/transport/jobs", {
    params: {
      scheduled_date: scheduledDate,
      skip,
      limit,
    },
  });
  return response.data;
};

export const createTransportJob = async (
  data: TransportJobCreate
): Promise<TransportJob> => {
  const response = await apiClient.post<TransportJob>("/transport/jobs", data);
  return response.data;
};

export const updateTransportJob = async (
  jobId: number,
  data: TransportJobUpdate
): Promise<TransportJob> => {
  const response = await apiClient.patch<TransportJob>(`/transport/jobs/${jobId}`, data);
  return response.data;
};

export const deleteTransportJob = async (jobId: number): Promise<void> => {
  await apiClient.delete(`/transport/jobs/${jobId}`);
};

export const getTransportJobDates = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>("/transport/job-dates");
  return response.data;
};
