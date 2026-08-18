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

// ─────────────────────────────────────────────
// Transport Optimization
// ─────────────────────────────────────────────

export type TransportLeg = "GO" | "RETURN" | "BOTH";

export interface TransportOptimizePayload {
  scheduled_date: string; // YYYY-MM-DD
  driver_ids: number[];
  depot_id: number;
  leg: TransportLeg;
}

/** A single driver → job assignment returned by the optimizer */
export interface LegAssignment {
  transport_job_id: number;
  driver_id: number;
  driver_name: string;
  pickup_time: string; // "HH:MM"
}

/** Result for one leg ("GO" or "RETURN") */
export interface LegOptimizationResult {
  status: "completed" | "no_solution" | "failed";
  assigned: number;
  unassigned: number;
  total_distance_meters: number;
  total_duration_seconds: number;
  assignments: LegAssignment[];
  unassigned_job_ids: number[];
  error?: string;
}

/** Full response from POST /transport/optimize */
export interface TransportOptimizeResponse {
  scheduled_date: string;
  tenant_id: number;
  results: Partial<Record<"GO" | "RETURN", LegOptimizationResult>>;
}

/**
 * Trigger transport leg optimization.
 * Runs synchronously on the backend and returns results directly (no polling needed).
 */
export const optimizeTransportJobs = async (
  payload: TransportOptimizePayload
): Promise<TransportOptimizeResponse> => {
  const response = await apiClient.post<TransportOptimizeResponse>(
    "/transport/optimize",
    payload,
    { timeout: 120000 }
  );
  return response.data;
};
