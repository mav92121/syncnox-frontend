import apiClient from "@/config/apiClient.config";
import { Depot } from "@/types/depots.type";

export const fetchDepots = async (): Promise<Depot[]> => {
  const response = await apiClient.get("/depots");
  return response.data;
};

export interface UpdateDepotPayload {
  name: string;
  address: {
    formatted_address: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

export const updateDepot = async (
  id: number,
  payload: UpdateDepotPayload
): Promise<Depot> => {
  const response = await apiClient.put(`/depots/${id}`, payload);
  return response.data;
};
