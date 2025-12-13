import apiClient from "@/config/apiClient.config";
import { Route } from "@/types/routes.type";

export const fetchRoutes = async (): Promise<Route[]> => {
  const response = await apiClient.get("optimization/routes");
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
