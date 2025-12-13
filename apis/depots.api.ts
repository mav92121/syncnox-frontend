import apiClient from "@/config/apiClient.config";
import { Depot } from "@/types/depots.type";

export const fetchDepots = async (): Promise<Depot[]> => {
  const response = await apiClient.get("/depots");
  return response.data;
};
