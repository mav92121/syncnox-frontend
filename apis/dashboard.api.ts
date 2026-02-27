import apiClient from "@/config/apiClient.config";
import { DashboardData } from "@/types/dashboard.type";

export const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData>("/dashboard");
  return response.data;
};
