import apiClient from "@/config/apiClient.config";
import { Route } from "@/types/routes.type";

export const fetchRoutes = async (): Promise<Route[]> => {
  const response = await apiClient.get("optimization/routes");
  return response.data;
};
