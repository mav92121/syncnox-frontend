import apiClient from "@/config/apiClient.config";

export const fetchDepots = async (): Promise<any[]> => {
  const response = await apiClient.get("/depots");
  return response.data;
};
