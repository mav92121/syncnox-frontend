import apiClient from "@/config/apiClient.config";
import { AllRoutes, Route } from "@/types/routes.type";

export const fetchRoutes = async (status?: string): Promise<AllRoutes[]> => {
  const query = status ? `?status=${status}` : "";
  const response = await apiClient.get(`routes${query}`);
  return response.data;
};

export interface CreateOptimizationRequestPayload {
  route_name: string;
  depot_id: number;
  job_ids: number[];
  team_member_ids: number[];
  scheduled_date: string; // YYYY-MM-DD format
  optimization_goal: "minimum_time" | "minimum_distance";
}

export const createOptimizationRequest = async (
  payload: CreateOptimizationRequestPayload
): Promise<Route> => {
  const response = await apiClient.post("optimization/requests", payload);
  return response.data;
};

export const getOptimizationRequest = async (id: number): Promise<Route> => {
  const response = await apiClient.get(`optimization/requests/${id}`);
  return response.data;
};

export interface UpdateOptimizationRequestPayload {
  route_name?: string;
}

export const updateOptimizationRequest = async (
  id: number,
  payload: UpdateOptimizationRequestPayload
): Promise<Route> => {
  const response = await apiClient.patch(
    `optimization/requests/${id}`,
    payload
  );
  return response.data;
};

export const deleteOptimizationRequest = async (id: number): Promise<void> => {
  await apiClient.delete(`optimization/requests/${id}`);
};
