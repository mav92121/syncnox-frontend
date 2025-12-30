import apiClient from "@/config/apiClient.config";
import { Depot } from "@/types/depots.type";

export const fetchDepots = async (): Promise<Depot[]> => {
  const response = await apiClient.get("/depots");
  return response.data;
};

export interface DepotPayload {
  name: string;
  address: {
    formatted_address: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

export const createDepot = async (payload: DepotPayload): Promise<Depot> => {
  const response = await apiClient.post("/depots", payload);
  return response.data;
};

export const deleteDepot = async (id: number): Promise<void> => {
  await apiClient.delete(`/depots/${id}`);
};

export const updateDepot = async (
  id: number,
  payload: DepotPayload
): Promise<Depot> => {
  const response = await apiClient.put(`/depots/${id}`, payload);
  return response.data;
};
